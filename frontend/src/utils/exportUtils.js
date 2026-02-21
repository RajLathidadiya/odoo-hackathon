import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = 'report.csv') => {
  try {
    // Handle different data structures
    let rows = [];
    
    if (Array.isArray(data)) {
      // If data is array of objects
      if (data.length === 0) {
        console.warn('No data to export');
        return;
      }
      
      const headers = Object.keys(data[0]);
      rows.push(headers.join(','));
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap values with commas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        rows.push(values.join(','));
      });
    } else if (typeof data === 'object') {
      // If data is object with key-value pairs
      const entries = Object.entries(data);
      rows.push('Key,Value');
      entries.forEach(([key, value]) => {
        const displayValue = typeof value === 'object' 
          ? JSON.stringify(value).replace(/"/g, '""')
          : String(value).replace(/"/g, '""');
        rows.push(`"${key}","${displayValue}"`);
      });
    }
    
    const csvContent = rows.join('\n');
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

/**
 * Export HTML element to PDF
 */
export const exportToPDF = async (elementId, filename = 'report.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
      return false;
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Create image from canvas
    const imgData = canvas.toDataURL('image/png');

    while (heightLeft >= 0) {
      const pageContent = document.createElement('img');
      pageContent.src = imgData;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      if (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
      }
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

/**
 * Export dashboard analytics data to CSV
 */
export const exportDashboardToCSV = (dashboard, filename = 'fleet-analytics.csv') => {
  try {
    let csvLines = [];
    
    // Header
    csvLines.push('FLEET MANAGEMENT SYSTEM - ANALYTICS REPORT');
    csvLines.push(`Generated: ${new Date().toLocaleString()}`);
    csvLines.push('');

    // Financial Overview
    if (dashboard?.financial_overview) {
      csvLines.push('FINANCIAL OVERVIEW');
      csvLines.push('Metric,Value');
      const financial = dashboard.financial_overview;
      csvLines.push(`Total Revenue,₹${financial.total_revenue || 0}`);
      csvLines.push(`Total Maintenance Cost,₹${financial.total_maintenance_cost || 0}`);
      csvLines.push(`Total Fuel Cost,₹${financial.total_fuel_cost || 0}`);
      csvLines.push(`Total Other Expenses,₹${financial.total_other_expenses || 0}`);
      csvLines.push(`Total Operational Cost,₹${financial.total_operational_cost || 0}`);
      csvLines.push(`Total Profit,₹${financial.total_profit || 0}`);
      csvLines.push(`Profit Margin,${financial.profit_margin || 'N/A'}`);
      csvLines.push('');
    }

    // Fleet Status
    if (dashboard?.fleet_status) {
      csvLines.push('FLEET STATUS');
      csvLines.push('Resource,Status,Count');
      
      const fleetStatus = dashboard.fleet_status;
      
      if (fleetStatus.vehicles) {
        Object.entries(fleetStatus.vehicles).forEach(([status, count]) => {
          csvLines.push(`Vehicles,${status},${count}`);
        });
      }
      
      if (fleetStatus.drivers) {
        Object.entries(fleetStatus.drivers).forEach(([status, count]) => {
          csvLines.push(`Drivers,${status},${count}`);
        });
      }
      
      if (fleetStatus.trips) {
        Object.entries(fleetStatus.trips).forEach(([status, count]) => {
          csvLines.push(`Trips,${status},${count}`);
        });
      }
      
      csvLines.push('');
    }

    // Fuel Efficiency
    if (dashboard?.fleet_efficiency) {
      csvLines.push('FUEL EFFICIENCY');
      csvLines.push('Metric,Value');
      csvLines.push(`Average Fuel Efficiency,${dashboard.fleet_efficiency.average_fuel_efficiency_kmpl || 'N/A'} km/L`);
      csvLines.push('');
    }

    const csvContent = csvLines.join('\n');
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    return true;
  } catch (error) {
    console.error('Error exporting dashboard to CSV:', error);
    return false;
  }
};

/**
 * Export array of fuel data to CSV
 */
export const exportFuelDataToCSV = (fuelData, filename = 'fuel-report.csv') => {
  try {
    let csvLines = [];
    
    csvLines.push('FUEL EFFICIENCY REPORT');
    csvLines.push(`Generated: ${new Date().toLocaleString()}`);
    csvLines.push('');
    
    csvLines.push('Vehicle,Average Efficiency (km/L),Total Fuel (L)');
    
    if (Array.isArray(fuelData)) {
      fuelData.forEach(vehicle => {
        const name = vehicle.vehicle_code || vehicle.vehicle || 'Unknown';
        const efficiency = vehicle.avg_efficiency ? Number(vehicle.avg_efficiency).toFixed(2) : 'N/A';
        const totalFuel = vehicle.total_fuel ? Number(vehicle.total_fuel).toFixed(2) : 'N/A';
        csvLines.push(`${name},${efficiency},${totalFuel}`);
      });
    }
    
    const csvContent = csvLines.join('\n');
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    return true;
  } catch (error) {
    console.error('Error exporting fuel data to CSV:', error);
    return false;
  }
};

/**
 * Helper function to download file
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format date for filename
 */
export const getFormattedDateForFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
