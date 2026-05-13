import '../styles/App.css';

export default function Results({ prediction }) {
  if (!prediction) return null;

  const getRiskColor = (risk) => {
    const colors = { Critical: '#ef4444', High: '#f97316', Moderate: '#f59e0b', Low: '#22c55e', Minimal: '#10b981' };
    return colors[risk] || '#6b7280';
  };

  const getConfColor = (conf) => {
    const colors = { High: '#22c55e', Medium: '#f59e0b', Low: '#ef4444' };
    return colors[conf] || '#6b7280';
  };

  const isCKD = prediction.binary_prediction === 'CKD';

  return (
    <div className="card">
      <h2>Prediction Results</h2>
      
      <div className="results-grid">
        <div className={`result-card ${isCKD ? 'ckd' : 'not-ckd'}`}>
          <h3>Diagnosis</h3>
          <div className="value">{prediction.binary_prediction}</div>
          <div className="sub">{(prediction.binary_probability * 100).toFixed(1)}% confidence</div>
        </div>
        
        {prediction.stage_prediction !== null && (
          <div className="result-card">
            <h3>CKD Stage</h3>
            <div className="value" style={{ color: '#3b82f6' }}>Stage {prediction.stage_prediction}</div>
          </div>
        )}
        
        <div className="result-card">
          <h3>Clinical Confidence</h3>
          <div className="value" style={{ color: getConfColor(prediction.confidence_score) }}>
            {prediction.confidence_score}
          </div>
          <div className="sub">{(prediction.confidence_value * 100).toFixed(1)}% score</div>
        </div>
        
        <div className="result-card">
          <h3>Risk Level</h3>
          <div className="value" style={{ color: getRiskColor(prediction.risk_level) }}>
            {prediction.risk_level}
          </div>
        </div>
      </div>
      
      {prediction.feature_importance && Object.keys(prediction.feature_importance).length > 0 && (
        <div className="feature-importance">
          <h3>Feature Importance</h3>
          {Object.entries(prediction.feature_importance).slice(0, 8).map(([feat, imp]) => (
            <div key={feat} className="feature-item">
              <span className="feature-name">{feat}</span>
              <div className="feature-bar">
                <div className="feature-fill" style={{ width: `${imp * 100}%` }} />
              </div>
              <span className="feature-value">{(imp * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
