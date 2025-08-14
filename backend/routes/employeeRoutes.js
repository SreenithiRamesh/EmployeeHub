const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');


const safeHandler = (fnName) => {
  return (typeof employeeController[fnName] === 'function')
    ? employeeController[fnName]
    : (req, res) => {
        res.status(501).json({
          error: `Controller method '${fnName}' is not implemented`
        });
      };
};


router.get('/dashboard/stats', safeHandler('getDashboardStats'));
router.get('/dashboard/recent-activity', safeHandler('getRecentActivity'));
router.get('/dashboard/department-stats', safeHandler('getDashboardDepartmentStats'));
router.get('/dashboard/hiring-trends', safeHandler('getHiringTrends'));


router.get('/reports/salary-analysis', safeHandler('getSalaryAnalysis'));
router.get('/reports/skills-analysis', safeHandler('getSkillsAnalysis'));
router.get('/reports/tenure-analysis', safeHandler('getTenureAnalysis'));
router.get('/reports/performance-metrics', safeHandler('getPerformanceMetrics'));
router.get('/reports/department-stats', safeHandler('getDepartmentStats'));

router.get('/skills', safeHandler('getAllSkills'));
router.get('/:id/skills', safeHandler('getEmployeeSkills'));
router.post('/:id/skills', safeHandler('addEmployeeSkill'));


router.get('/departments', safeHandler('getAllDepartments'));


router.get('/:id/projects', safeHandler('getEmployeeProjectDetails'));

router.get('/', safeHandler('getAllEmployees'));
router.post('/', safeHandler('createEmployee'));
router.get('/:id', safeHandler('getEmployeeById'));
router.put('/:id', safeHandler('updateEmployee'));
router.delete('/:id', safeHandler('deleteEmployee'));

module.exports = router;
