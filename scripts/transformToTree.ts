#!/bin/env ts-node-esm

import { getClient } from "./lib/connection.js";

interface State {
  id: string;
  name: string;
  counties: County[];
}

interface County {
  fips: string;
  name: string;
  cities: City[];
}

interface City {
  id: number;
  name: string;
}

type Row = {
  id: number;
  name: string;
  county_fips: string;
  county_name: string;
  state_id: string;
  state_name: string;
};

/**
 * Because data are ordered by state_name, then county_name and then by city_name
 * we need O(n) iterations to transform them to State -> County -> City tree
 *
 * NOTE: Sorting can be usually done in O(n log(n))
 */
async function run() {
  const client = getClient();

  const result: State[] = [];

  try {
    await client.connect();
    const { rows } = await client.query<Row>(`
      SELECT CI.id, CI.name, CO.fips AS county_fips, CO.name AS county_name, S.id AS state_id, S.name AS state_name
      FROM "cities" CI
      INNER JOIN "counties" CO
        ON CI.county_fips = CO.fips
      INNER JOIN "states" S
        ON CI.state_id = S.id
      ORDER BY S.name ASC, CO.name ASC, CI.name ASC
    `);

    let lastState: State | null = null;
    let lastCounty: County | null = null;
    for (const row of rows) {
      if (!lastState || lastState.id !== row.state_id) {
        lastState = { id: row.state_id, name: row.state_name, counties: [] };
        result.push(lastState);
      }
      if (!lastCounty || lastCounty.fips !== row.county_fips) {
        lastCounty = {
          fips: row.county_fips,
          name: row.county_name,
          cities: [],
        };
        lastState.counties.push(lastCounty);
      }
      const city: City = { id: row.id, name: row.name };
      lastCounty.cities.push(city);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run().catch((err) => console.error(err));
