import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8000";

const initialFormData = {
  age: 45,
  bp: 80,
  sg: "1.02",
  al: 0,
  su: 0,
  rbc: "normal",
  pc: "normal",
  pcc: "notpresent",
  ba: "notpresent",
  bgr: 100,
  bu: 30,
  sc: 1.2,
  sod: 140,
  pot: 4.5,
  hemo: 14,
  pcv: 42,
  wbcc: 7000,
  rbcc: 4.5,
  htn: "no",
  dm: "no",
  cad: "no",
  appet: "good",
  pe: "no",
  ane: "no",
};

export default function CKDForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialFormData);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { token, user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      age: parseFloat(formData.age),
      bp: parseFloat(formData.bp),
      sg: parseFloat(formData.sg),
      al: parseInt(formData.al),
      su: parseInt(formData.su),
      bgr: parseFloat(formData.bgr),
      bu: parseFloat(formData.bu),
      sc: parseFloat(formData.sc),
      sod: parseFloat(formData.sod),
      pot: parseFloat(formData.pot),
      hemo: parseFloat(formData.hemo),
      pcv: parseFloat(formData.pcv),
      wbcc: parseFloat(formData.wbcc),
      rbcc: parseFloat(formData.rbcc),
    };
    onSubmit(data);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setFileName("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append("file", file);

      const res = await fetch(`${API_URL}/api/records/extract-from-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataFile,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.extracted_values) {
          setFormData((prev) => ({ ...prev, ...data.extracted_values }));
          setFileName(data.file_name);
        }
      }
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>Patient Clinical Data</h2>
      <form onSubmit={handleSubmitForm}>
        <div className="form-section">
          <h3>Demographics</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Age (years)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
              />
            </div>
            <div className="form-group">
              <label>Blood Pressure (mm/Hg)</label>
              <input
                type="number"
                name="bp"
                value={formData.bp}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Urinalysis</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Specific Gravity</label>
              <select name="sg" value={formData.sg} onChange={handleChange}>
                <option value="1.005">1.005</option>
                <option value="1.010">1.010</option>
                <option value="1.015">1.015</option>
                <option value="1.020">1.020</option>
                <option value="1.025">1.025</option>
              </select>
            </div>
            <div className="form-group">
              <label>Albumin (0-5)</label>
              <select name="al" value={formData.al} onChange={handleChange}>
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sugar (0-5)</label>
              <select name="su" value={formData.su} onChange={handleChange}>
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Red Blood Cells</label>
              <select name="rbc" value={formData.rbc} onChange={handleChange}>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pus Cell</label>
              <select name="pc" value={formData.pc} onChange={handleChange}>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pus Cell Clumps</label>
              <select name="pcc" value={formData.pcc} onChange={handleChange}>
                <option value="notpresent">Not Present</option>
                <option value="present">Present</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bacteria</label>
              <select name="ba" value={formData.ba} onChange={handleChange}>
                <option value="notpresent">Not Present</option>
                <option value="present">Present</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Blood Tests</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Blood Glucose (mgs/dl)</label>
              <input
                type="number"
                name="bgr"
                value={formData.bgr}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Blood Urea (mgs/dl)</label>
              <input
                type="number"
                name="bu"
                value={formData.bu}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Serum Creatinine (mgs/dl)</label>
              <input
                type="number"
                name="sc"
                value={formData.sc}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Sodium (mEq/L)</label>
              <input
                type="number"
                name="sod"
                value={formData.sod}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Potassium (mEq/L)</label>
              <input
                type="number"
                name="pot"
                value={formData.pot}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Hemoglobin (gms)</label>
              <input
                type="number"
                name="hemo"
                value={formData.hemo}
                onChange={handleChange}
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>Packed Cell Volume</label>
              <input
                type="number"
                name="pcv"
                value={formData.pcv}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>White Blood Cell Count</label>
              <input
                type="number"
                name="wbcc"
                value={formData.wbcc}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Red Blood Cell Count</label>
              <input
                type="number"
                name="rbcc"
                value={formData.rbcc}
                onChange={handleChange}
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Medical History</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Hypertension</label>
              <select name="htn" value={formData.htn} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Diabetes Mellitus</label>
              <select name="dm" value={formData.dm} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Coronary Artery Disease</label>
              <select name="cad" value={formData.cad} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Appetite</label>
              <select
                name="appet"
                value={formData.appet}
                onChange={handleChange}
              >
                <option value="good">Good</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pedal Edema</label>
              <select name="pe" value={formData.pe} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Anemia</label>
              <select name="ane" value={formData.ane} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="button-group">
          {user && (
            <label className="file-upload-btn">
              {uploading ? "⏳ Processing..." : "📄 Upload Report (PDF/Word/Image)"}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.jpg,.jpeg,.png,.gif,.bmp,.txt"
                style={{ display: "none" }}
              />
            </label>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "⏳ Analyzing..." : "🔬 Predict CKD"}
          </button>
          <button type="button" onClick={handleReset} className="secondary">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
