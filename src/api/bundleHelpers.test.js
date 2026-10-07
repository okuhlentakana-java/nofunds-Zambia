import assert from "node:assert/strict";
import test from "node:test";
import { normalizeBundle } from "./bundleHelpers.js";

const bundle = (description, code = "5MB", category = "combo") =>
  normalizeBundle({
    code,
    category,
    currency: "K",
    description,
    price: 2,
  });

test("keeps combo bundles in Combo and adds SMS membership from quantities", () => {
  const normalized = bundle("5Mins + 5MB + 5SMS daily bundle");

  assert.equal(normalized.category, "combo");
  assert.deepEqual(normalized.categories, ["combo", "sms", "voice"]);
  assert.equal(normalized.label, "Combo");
  assert.equal(normalized.name, "5 MB");
});

test("parses every combo part from the description", () => {
  assert.deepEqual(bundle("5Mins + 5MB + 5SMS daily bundle").components, [
    "5 Min",
    "5 MB",
    "5 SMS",
  ]);
  assert.deepEqual(
    bundle("150Mins + 2.5GB + 50SMS + 640MB streaming weekly bundle", "2.5GB").components,
    ["150 Min", "2.5 GB", "50 SMS", "640 MB streaming"]
  );
  assert.deepEqual(bundle("2GB daily bundle", "2GB", "data").components, []);
});

test("omits trailing validity and group text from combo components", () => {
  assert.deepEqual(
    bundle("5Mins + 5MB + 5SMS daily bundle 1Zed Voice").components,
    ["5 Min", "5 MB", "5 SMS"]
  );
  assert.deepEqual(
    bundle("150Mins + 2.5GB + 50SMS + 640MB streaming weekly bundle Unik and Pulse combo", "2.5GB").components,
    ["150 Min", "2.5 GB", "50 SMS", "640 MB streaming"]
  );
});

test("shows Daily as the validity for daily bundles", () => {
  assert.equal(bundle("110MB daily bundle", "110MB", "data").validity, "Daily");
});

test("adds Voice membership when combo description has minutes", () => {
  assert.deepEqual(bundle("5Mins + 5MB + 5SMS daily bundle").categories, [
    "combo",
    "sms",
    "voice",
  ]);
  assert.deepEqual(bundle("5MB + 5SMS daily bundle").categories, ["combo", "sms"]);
});

test("adds Social membership when combo details identify a social service", () => {
  const normalized = bundle("WhatsApp 500MB weekly bundle");

  assert.deepEqual(normalized.categories, ["combo", "social"]);
  assert.equal(normalized.subCategory, "weekly");
});

test("adds Night membership when combo details identify a night bundle", () => {
  const normalized = bundle("1GB night bundle");

  assert.deepEqual(normalized.categories, ["combo", "night"]);
});

test("supports multiple service filters without changing non-combo categories", () => {
  const combo = bundle("WhatsApp + 20SMS night bundle");
  const social = bundle("WhatsApp daily bundle", "100MB", "social");

  assert.deepEqual(combo.categories, ["combo", "night", "social", "sms"]);
  assert.deepEqual(social.categories, ["social"]);
});

test("assigns bundle groups from the trailing description label", () => {
  const groups = [
    ["1Zed Data", "1zed-data"],
    ["1Zed Voice", "1zed-voice"],
    ["Mixo Mixo", "mixo-mixo"],
    ["Unik and Pulse Data", "unik-pulse-data"],
    ["Unik and Pulse combo", "unik-pulse-combo"],
  ];

  for (const [label, id] of groups) {
    assert.equal(bundle(`500MB daily bundle ${label}`, "500MB", "data").bundleGroup, id);
  }

  assert.equal(bundle("500MB daily bundle", "500MB", "data").bundleGroup, null);
});
