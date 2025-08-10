exports.addEmployeeSkill = (req, res) => {
  const { employee_id, skill_id } = req.body;
  const sql = `INSERT INTO employee_skills (employee_id, skill_id) VALUES (?, ?)`;
  db.query(sql, [employee_id, skill_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.getEmployeeSkills = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT s.* FROM skills s
    JOIN employee_skills es ON s.id = es.skill_id
    WHERE es.employee_id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};