export function mapId(doc) {
  if (!doc) return doc;
  const json = doc.toJSON ? doc.toJSON() : JSON.parse(JSON.stringify(doc));
  json.id = json._id?.toString();
  delete json._id;
  delete json.__v;
  return json;
}

export function mapArrayId(docs) {
  return docs.map(mapId);
}


