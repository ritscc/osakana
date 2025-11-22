import { parseAsString, parseAsInteger, createLoader } from "nuqs/server";

export const searchParams = {
  unicode: parseAsString.withDefault(""),
  result: parseAsString.withDefault(""),
  error: parseAsString.withDefault(""),
  combo: parseAsInteger.withDefault(0),
};

export const loadSearchParams = createLoader(searchParams);
