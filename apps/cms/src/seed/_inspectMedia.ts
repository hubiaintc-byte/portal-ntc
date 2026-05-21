import { getPayload } from "payload";

import config from "../payload.config";

async function main() {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "media",
    limit: 30,
    overrideAccess: true,
    sort: "id",
  });
  console.log(`Total docs: ${res.totalDocs}`);
  for (const d of res.docs) {
    console.log(`id=${d.id} filename=${d.filename} prefix=${d.prefix} url=${d.url}`);
  }
  process.exit(0);
}

void main();
