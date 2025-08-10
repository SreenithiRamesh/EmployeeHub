// backend/controllers/notificationController.js
exports.getUpcomingAnniversaries = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const sql = `
      SELECT id, name, joining_date, 
        DATEDIFF(DATE_ADD(joining_date, INTERVAL YEAR(CURDATE()) - YEAR(joining_date) YEAR), CURDATE()) as days_remaining
      FROM employees
      WHERE 
        DATE_ADD(joining_date, INTERVAL YEAR(CURDATE()) - YEAR(joining_date) YEAR) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY days_remaining ASC
    `;
    
    const [results] = await db.query(sql, [daysAhead]);
    res.json(results);
  } catch (err) {
    handleQueryError(res, err);
  }
};

// src/components/AnniversaryNotifications.jsx
import React, { useEffect, useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import api from '../services/api';

export default function AnniversaryNotifications() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications/anniversaries');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
        aria-controls="notifications-menu"
        aria-haspopup="true"
      >
        <Badge badgeContent={notifications.length} color="secondary">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: '300px',
            maxHeight: '400px'
          }
        }}
      >
        <Typography variant="subtitle1" sx={{ p: 2 }}>Upcoming Anniversaries</Typography>
        {notifications.length === 0 ? (
          <MenuItem disabled>No upcoming anniversaries</MenuItem>
        ) : (
          <List dense>
            {notifications.map((notification) => (
              <ListItem key={notification.id}>
                <ListItemText
                  primary={notification.name}
                  secondary={`${notification.days_remaining} days until anniversary`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}