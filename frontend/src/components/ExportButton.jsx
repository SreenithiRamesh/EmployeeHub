// src/components/ExportButton.jsx
import React from 'react';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const ExportButton = ({ data, fileName = 'employees', buttonText = 'Export to Excel' }) => {
  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <Button 
      variant="outlined" 
      startIcon={<Download />} 
      onClick={exportToCSV}
      sx={{ ml: 2 }}
    >
      {buttonText}
    </Button>
  );
};

export default ExportButton;