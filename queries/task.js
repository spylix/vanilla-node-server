module.exports = {
  GET: {
    query: "SELECT * FROM tasks",
  },
  POST: {
    query: `
        INSERT INTO tasks (name, checked, list_id) 
        VALUES ($1, false, $2) 
        RETURNING *`,
    values: ["name", "list_id"],
  },
  DELETE: {
    query: `
        DELETE FROM tasks
        WHERE id = $1`,
    values: ["id"],
  },
  PUT: {
    query: `
        UPDATE tasks
        SET checked = $2, name = $3, list_id = $4
        WHERE id = $1
        RETURNING *`,
    values: ["id", "checked", "name", "list_id"],
  },
};
