#!/bin/env ts-node-esm

import csvToJson from "csvtojson";
import format from "pg-format";

import { getClient } from './lib/connection.js';

type RawRow = Record<
  | "city"
  | "city_ascii"
  | "state_id"
  | "state_name"
  | "county_fips"
  | "county_name"
  | "lat"
  | "lng"
  | "population"
  | "density"
  | "source"
  | "military"
  | "incorporated"
  | "timezone"
  | "ranking"
  | "zips"
  | "id",
  string
>;

const INSERT_STATES_QUERY = 'INSERT INTO "states" (id, name) VALUES %L';
const INSERT_COUNTIES_QUERY =
  'INSERT INTO "counties" (fips, name, state_id) VALUES %L';
const INSERT_CITIES_QUERY =
  'INSERT INTO "cities" (id, name, name_ascii, lat, lng, population, density, source, military, incorporated, timezone, ranking, zips, state_id, county_fips) VALUES %L';

async function run() {
  if (!process.argv?.[2]) {
    console.error("Usage: ./scripts/import.ts CSV_file");
    process.exit(1);
  }

  const data: RawRow[] = await csvToJson().fromFile(process.argv[2]);

  const states: Record<string, [id: string, name: string]> = {};
  const counties: Record<
    string,
    [fips: string, name: string, state_id: string]
  > = {};
  const cities: Record<
    string,
    [
      id: number,
      name: string,
      name_ascii: string,
      lat: number,
      lng: number,
      population: number,
      density: number,
      source: string,
      military: boolean,
      incorporated: boolean,
      timezone: string,
      ranking: number,
      zips: string,
      state_id: string,
      county_fips: string
    ]
  > = {};

  for (const row of data) {
    if (!states[row.state_id]) {
      states[row.state_id] = [row.state_id, row.state_name];
    }

    if (!counties[row.county_fips]) {
      counties[row.county_fips] = [
        row.county_fips,
        row.county_name,
        row.state_id,
      ];
    }

    if (!cities[row.id]) {
      cities[row.id] = [
        parseInt(row.id, 10),
        row.city,
        row.city_ascii,
        parseFloat(row.lat),
        parseFloat(row.lng),
        parseFloat(row.population),
        parseFloat(row.density),
        row.source,
        row.military === "TRUE",
        row.incorporated === "TRUE",
        row.timezone,
        parseInt(row.ranking, 10),
        row.zips,
        row.state_id,
        row.county_fips,
      ];
    }
  }

  const client = getClient();

  try {
    await client.connect();
    await client.query("BEGIN");

    await client.query(format(INSERT_STATES_QUERY, Object.values(states)));
    await client.query(format(INSERT_COUNTIES_QUERY, Object.values(counties)));
    await client.query(format(INSERT_CITIES_QUERY, Object.values(cities)));

    await client.query("COMMIT");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run().catch((err) => console.error(err));
