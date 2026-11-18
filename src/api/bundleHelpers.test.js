import assert from "node:assert/strict";
import test from "node:test";
import { compareBundles, normalizeBundle } from "./bundleHelpers.js";

const bundle = (description, code = "5MB", category = "combo", price = 2) =>
  normalizeBundle({
    code,
    category,
    currency: "K",
    description,
    price,
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

test("shows streaming allowances for data bundles, including unlimited streaming", () => {
  assert.deepEqual(
    bundle("2GB + 650MB streaming weekly bundle", "2GB", "data").components,
    ["2 GB", "650 MB streaming"]
  );
  assert.deepEqual(
    bundle("8.5GB + 5.5GB streaming monthly bundle", "85GB", "data").components,
    ["8.5 GB", "5.5 GB streaming"]
  );
  assert.deepEqual(
    bundle("40GB + Unlimited Streaming monthly bundle", "40GB", "data").components,
    ["40 GB", "Unlimited Streaming"]
  );
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

test("parses hourly and non-expiring bundle validity", () => {
  const twoHour = bundle("2GB 2hrs bundle 1Zed Data", "2GB", "data");
  const fiveHour = bundle("6GB 5hrs bundle 1Zed Data", "6GB", "data");
  const noExpiry = bundle("3GB non-expiry bundle 1Zed Data", "3GB", "data");

  assert.equal(twoHour.subCategory, "hourly");
  assert.equal(twoHour.validity, "2 hours");
  assert.equal(twoHour.bundleGroup, "1zed-data");
  assert.equal(fiveHour.subCategory, "hourly");
  assert.equal(fiveHour.validity, "5 hours");
  assert.equal(noExpiry.subCategory, "non-expiry");
  assert.equal(noExpiry.validity, "No expiry");
});

test("sorts voice bundles by minutes before data-size-sorted bundles without voice", () => {
  const bundles = [
    bundle("2GB weekly bundle", "2GB", "data"),
    bundle("45Mins + 45MB + 45SMS daily bundle", "45MB"),
    bundle("5Mins + 5MB + 5SMS daily bundle", "5MB"),
    bundle("1GB weekly bundle", "1GB", "data"),
    bundle("12Mins + 12MB + 12SMS weekly bundle", "12MB"),
  ];

  assert.deepEqual(bundles.sort(compareBundles).map(({ voiceMinutes, sizeMb }) =>
    voiceMinutes ?? sizeMb
  ), [5, 12, 45, 1024, 2048]);
});

test("sorts bundles by ascending price before applying voice and data ordering", () => {
  const bundles = [
    bundle("45Mins + 45MB + 45SMS daily bundle", "45MB", "combo", 10),
    bundle("2GB daily bundle", "2GB", "data", 5),
    bundle("12Mins + 12MB + 12SMS daily bundle", "12MB", "combo", 5),
    bundle("5Mins + 5MB + 5SMS daily bundle", "5MB", "combo", 5),
    bundle("1GB daily bundle", "1GB", "data", 5),
  ];

  assert.deepEqual(
    bundles.sort(compareBundles).map(({ code }) => code),
    ["5MB", "12MB", "1GB", "2GB", "45MB"]
  );
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
