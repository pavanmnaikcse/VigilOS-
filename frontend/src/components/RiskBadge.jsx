import React from 'react';

const RiskBadge = ({ level = 'LOW', score }) => {
  const getColor = (lvl) => {
    const l = (lvl || '').toUpperCase();
    if (l === 'HIGH' || l === 'BLOCK') return '#EF4444';
    if (l === 'MEDIUM' || l === 'ESCALATE') return '#F59E0B';
    return '#22C55E';
  };

  const color = getColor(level);

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      backgroundColor: `${color}22`, 
      color: color, 
      padding: '0.25rem 0.75rem', 
      borderRadius: '999px',
      border: `1px solid ${color}55`,
      fontSize: '0.75rem',
      fontWeight: 'bold'
    }}>
      <span>{level.toUpperCase()}</span>
      {score !== undefined && (
        <span style={{ 
          borderLeft: `1px solid ${color}55`, 
          paddingLeft: '0.5rem' 
        }}>
          {Number(score).toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default RiskBadge;
