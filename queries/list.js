module.exports = {
  GET: {
    query: "SELECT * FROM lists",
  },
  POST: {
    query: `
      INSERT INTO lists (name)
      VALUES ($1)
      RETURNING *`,
    values: ["name"],
  },
  DELETE: {
    query: `
      DELETE FROM lists
      WHERE id = $1`,
    values: ["id"],
  },
  PUT: {
    query: `
      UPDATE lists
      SET name = $2
      WHERE id = $1
      RETURNING *`,
    values: ["id", "name"],
  },
};
