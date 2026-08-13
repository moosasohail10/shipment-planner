// Paste your Google Apps Script URL here!
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzE97nuElYbx_KKgSYqOj_GQSiLx5S4zPmVOsaO-Vf00cc0681UNnaBhdbCMEUWkMIT/exec'; 

let prodChartInstance = null;
let regChartInstance = null;
let currentUserRole = ""; 

// --- 0. LOGIN & ROLE ACCESS LOGIC ---
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    loginBtn.innerHTML = '<span class="spinner"></span>Verifying...';
    loginBtn.disabled = true;

    const payload = { action: "login", username: document.getElementById('login-user').value, password: document.getElementById('login-pass').value };

    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(response => response.json())
    .then(data => {
        if(data.status === "success") {
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
            currentUserRole = data.role; 
            applyRoleAccess(data.role);
            showToast(`Welcome! Logged in as: ${data.role}`, "success");
        } else {
            showToast("Invalid Username or Password", "error");
            loginBtn.textContent = 'Login'; loginBtn.disabled = false;
        }
    }).catch(error => { showToast("Connection error.", "error"); loginBtn.textContent = 'Login'; loginBtn.disabled = false; });
});

function applyRoleAccess(role) {
    const allTabs = ['btn-request', 'btn-approve', 'btn-tracker', 'btn-queue', 'btn-plant', 'btn-transshipment', 'btn-dashboard'];
    allTabs.forEach(id => document.getElementById(id).style.display = 'none');

    if (role === "Super Admin") {
        allTabs.forEach(id => document.getElementById(id).style.display = 'inline-block');
        document.getElementById('btn-request').click(); 
    }
    else if (role.includes("Regional Distribution Manager")) {
        document.getElementById('btn-request').style.display = 'inline-block';
        document.getElementById('btn-approve').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block';
        document.getElementById('btn-dashboard').style.display = 'inline-block';
        document.getElementById('btn-approve').click(); 
    } 
    else if (role === "District Sales Manager" || role === "Regional Sales Manager") {
        document.getElementById('btn-request').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block';
        document.getElementById('btn-dashboard').style.display = 'inline-block';
        document.getElementById('btn-request').click(); 
    } 
    else if (role.includes("Zonal Sales Coordinator")) {
        document.getElementById('btn-queue').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block';
        document.getElementById('btn-dashboard').style.display = 'inline-block';
        document.getElementById('btn-queue').click(); 
    } 
    else if (role === "WH Transshipment Officer") {
        document.getElementById('btn-transshipment').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block';
        document.getElementById('btn-dashboard').style.display = 'inline-block';
        document.getElementById('btn-transshipment').click(); 
    }
    else if (role.includes("Plant Logistics")) {
        document.getElementById('btn-plant').style.display = 'inline-block';
        document.getElementById('btn-transshipment').style.display = 'inline-block'; 
        document.getElementById('btn-tracker').style.display = 'inline-block'; 
        document.getElementById('btn-dashboard').style.display = 'inline-block'; 
        document.getElementById('btn-plant').click(); 
    } else { alert("Role not recognized."); }
}

document.getElementById('btn-logout').addEventListener('click', function() {
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('login-form').reset();
    currentUserRole = ""; 
});

// --- 1. TAB & CASCADING DROPDOWN LOGIC ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.id.replace('btn-', 'tab-')).classList.add('active');
    });
});

const warehouseData = {"CENTER (ZONE)":{"BAHAWALPUR":[{"code":"512700","name":"LODHRAN BULK WH"},{"code":"512718","name":"LODHRAN3 WH"},{"code":"512719","name":"KEHROR PACCA 4 WH"},{"code":"512721","name":"LODHRAN-4 WH"},{"code":"513201","name":"HASILPUR WH"},{"code":"513204","name":"YAZMAN WH"},{"code":"513212","name":"NOORPUR NAURANGA 2 WH"},{"code":"513214","name":"BAHAWALPUR4 WH"},{"code":"513218","name":"BAHAWALPUR-7 WH"},{"code":"513219","name":"BAHAWALPUR-8 WH"},{"code":"513221","name":"Bahawalpur-10 WH"},{"code":"513222","name":"Bahawalpur-11 WH"},{"code":"513223","name":"Samma Satta Bulk WH"},{"code":"513302","name":"BAHAWALNAGAR WH"},{"code":"513307","name":"CHISHTIAN WH-3"},{"code":"513310","name":"Minchinabad-2 WH"},{"code":"513311","name":"Fort Abbas-2 WH"},{"code":"513312","name":"Khichiwala WH"}],"D.G.KHAN":[{"code":"512101","name":"BHAKKAR WH"},{"code":"512102","name":"Bhakkar 2 WH"},{"code":"512801","name":"LAYYAH WH"},{"code":"512803","name":"KAROR LAL ESAN WH"},{"code":"512804","name":"Qaziabad WH"},{"code":"512901","name":"JATOI WH"},{"code":"512902","name":"KOT ADDU WH"},{"code":"512907","name":"Pathan Hotel WH"},{"code":"512908","name":"MUZAFFARGARH BULK WH"},{"code":"512909","name":"Langar Sarai WH"},{"code":"512910","name":"Adda Basira WH"},{"code":"512912","name":"Muzaffargarh 4 WH"},{"code":"513001","name":"D.G. KHAN WH"},{"code":"513002","name":"BAGGA SHER WH"},{"code":"513004","name":"TAUNSA WH"},{"code":"513006","name":"DG Khan Bulk WH"},{"code":"513101","name":"JAMPUR WH"},{"code":"513103","name":"Fazilpur WH"},{"code":"513104","name":"RAJANPUR-2 WH"},{"code":"545802","name":"D.I.KHAN WH 2"}],"MULTAN":[{"code":"512400","name":"BUREWALA BULK WH"},{"code":"512403","name":"VEHARI WH"},{"code":"512404","name":"GAGO MANDI WH"},{"code":"512407","name":"MAILSI-3 WH"},{"code":"512415","name":"ADDA ZAHEER NAGAR WH"},{"code":"512417","name":"Mailsi Bulk WH"},{"code":"512501","name":"MIANCHANU WH"},{"code":"512502","name":"KHANEWAL WH"},{"code":"512506","name":"MIANCHANNU 2 WH"},{"code":"512507","name":"KHANEWAL-2 WH"},{"code":"512508","name":"MIAN CHANNU-3 WH"},{"code":"512510","name":"Batti Bangla WH"},{"code":"512511","name":"PULL-14 WH"},{"code":"512600","name":"MULTAN 2 WH"},{"code":"512601","name":"MULTAN WH"},{"code":"512615","name":"CHOWK MAITLA WH"},{"code":"512620","name":"Multan Bulk - 11"},{"code":"512624","name":"JALALPUR PIRWALA WH"},{"code":"512628","name":"ADDA SADIQ WALA BULK 2 WH"},{"code":"512629","name":"MULTAN BULK 12 WH"},{"code":"512630","name":"MULTAN 13 WH"},{"code":"512633","name":"JALALPUR PIRWALA-2 WH"},{"code":"512635","name":"MULTAN 16 WH"},{"code":"512636","name":"MULTAN 17 BULK WH"},{"code":"512637","name":"MULTAN 18 WH"},{"code":"512638","name":"ADDA SADIQ WALA BULK 3 WH"},{"code":"512639","name":"MULTAN 20 WH"},{"code":"512640","name":"MULTAN 22 WH"},{"code":"512641","name":"MULTAN 21 WH"},{"code":"512642","name":"Multan 23 WH"},{"code":"512643","name":"Multan Bulk-25 WH"},{"code":"512644","name":"Multan-24 WH"},{"code":"512645","name":"Multan-26 WH"},{"code":"512647","name":"INDUSTRIAL AREA MULTAN-2 WH"},{"code":"512648","name":"Kayanpur Chowk WH"},{"code":"512649","name":"Industrial Area Multan-3 WH"},{"code":"512650","name":"ADDA LAR WH"},{"code":"512651","name":"Tatepur WH"},{"code":"512652","name":"Qadirpur Ran WH"},{"code":"512653","name":"Industrial Area Multan-4 WH"},{"code":"512654","name":"Chowk BCG WH"},{"code":"512655","name":"Qadirpur Ran-2 WH"},{"code":"512656","name":"JALALPUR PIRWALA - 3 WH"},{"code":"512657","name":"Industrial Area Multan-5 WH"},{"code":"512658","name":"CHOWK NAG SHAH-3 WH"},{"code":"512660","name":"Adda Lar-3 WH"},{"code":"512661","name":"Industrial Area Multan-6 WH"},{"code":"512662","name":"ADDA LAR-4 WH"},{"code":"512663","name":"CHOWK NAG SHAH-4 WH"},{"code":"512664","name":"NLC ByPass WH"},{"code":"512665","name":"Industrial Area Multan-7 WH"},{"code":"512666","name":"Munirabad Bulk WH"},{"code":"512667","name":"Multan Bulk 27 WH"},{"code":"512668","name":"Multan Bulk 28 WH"},{"code":"512669","name":"Multan Bulk 29 WH"},{"code":"512670","name":"Qadirpur Ran-3 WH"},{"code":"512671","name":"Multan Bulk 30 WH"},{"code":"512672","name":"Adda Gopalpur WH"},{"code":"512673","name":"Industrial Area Multan-08 WH"},{"code":"512674","name":"Pakarab Plant WH"}]},"NORTH (ZONE)":{"FAISALABAD":[{"code":"510201","name":"CHINIOT-2 WH"},{"code":"510801","name":"MANDI BAHAUDIN WH"},{"code":"511603","name":"CHINIOT WH"},{"code":"511612","name":"JHANG 4 WH"},{"code":"511613","name":"Jhang 5 WH"},{"code":"511701","name":"JARANWALA WH"},{"code":"511703","name":"SAMUNDRI 2 WH"},{"code":"511709","name":"FAISALABAD-2 WH"},{"code":"511710","name":"FAISALABAD INDUSTRIAL ESTATE WH"},{"code":"511801","name":"SARGODHA WH"},{"code":"511802","name":"BHALWAL WH"},{"code":"511805","name":"MIANWALI WH"}],"ISLAMABAD":[{"code":"510102","name":"Faqirabad-3 WH"},{"code":"540802","name":"Baffa Duraha-2 WH"},{"code":"541304","name":"MARDAN3 WH"},{"code":"541604","name":"Peshawar 4 WH"}],"LAHORE":[{"code":"510605","name":"Eminabad WH"},{"code":"510701","name":"DASKA WH"},{"code":"510901","name":"NAROWAL WH"},{"code":"511001","name":"HAFIZABAD WH"},{"code":"511002","name":"Pindi Bhattian WH"},{"code":"511202","name":"KHORI LHR WH"},{"code":"511204","name":"Sarsabz Retail Outlet Sharqpur"},{"code":"511302","name":"PATTOKI WH"},{"code":"511303","name":"KASUR WH"},{"code":"511307","name":"ELLAHABAD-2 WH"},{"code":"513501","name":"MANDI FAIZABAD WH"},{"code":"513502","name":"SHAHKOT WH"},{"code":"536001","name":"DH-WH"}],"SAHIWAL":[{"code":"511401","name":"OKARA WH"},{"code":"511402","name":"DEPALPUR WH"},{"code":"511406","name":"OKARA BULK WH"},{"code":"511408","name":"HAVAILI LAKHA-2 WH"},{"code":"511409","name":"Okara-2 WH"},{"code":"511505","name":"GOJRA BULK WH"},{"code":"511507","name":"T.T.SINGH WH2"},{"code":"511508","name":"T.T Singh-3 WH"},{"code":"512201","name":"SAHIWAL WH"},{"code":"512202","name":"HARAPPA WH"},{"code":"512205","name":"90-Morr WH"},{"code":"512206","name":"ADDA GHAZIABAD WH"},{"code":"512207","name":"CHICHAWATNI-2 WH"},{"code":"512208","name":"Qadirabad WH"},{"code":"512301","name":"PAKPATTAN WH"},{"code":"512302","name":"ARIFWALA WH"},{"code":"512305","name":"Pakpattan Bulk WH"}]},"SOUTH (ZONE)":{"HYDERABAD":[{"code":"520902","name":"NAWABSHAH WH"},{"code":"521001","name":"SHAHDADPUR WH"},{"code":"521002","name":"KHIPRO WH"},{"code":"521103","name":"MIRPURKHAS-3 WH"},{"code":"521201","name":"TANDO ALLAH YAR WH"},{"code":"521501","name":"MATLI WH"},{"code":"521506","name":"GOLARCHI-2 WH"},{"code":"521602","name":"THATTA WH"},{"code":"521802","name":"HALA 2"},{"code":"521804","name":"Hala-3 WH"},{"code":"522501","name":"TANDO ALLAH YAR-2 WH"},{"code":"532601","name":"HUB CHOWKI WH"},{"code":"890002","name":"Qazi WH"}],"R.Y.KHAN":[{"code":"513202","name":"AHMED PUR EAST WH"},{"code":"513400","name":"SADIQABAD BULK WH"},{"code":"513401","name":"RAHIM YAR KHAN WH"},{"code":"513402","name":"KHANPUR WH"},{"code":"513404","name":"LIAQATPUR WH"},{"code":"513406","name":"Rahim Yar Khan WH - 2"},{"code":"513409","name":"RAHIM YAR KHAN - 3 WH"},{"code":"513415","name":"RYK BULK WAREHOUSE"},{"code":"513427","name":"KHANPUR-2 WH"},{"code":"513432","name":"SADIQABAD BULK-2 WH"},{"code":"513435","name":"SADIQABAD BULK-3 WH"},{"code":"513439","name":"Thali Chowk Bulk WH"},{"code":"513440","name":"Sardar Garh Bulk WH"},{"code":"513441","name":"Akramabad Bulk WH"},{"code":"513442","name":"Hussain Abad Bulk WH"},{"code":"513443","name":"Basti Malikpur Bulk WH"},{"code":"513444","name":"Waahi Shah Bulk WH"},{"code":"513445","name":"Al-Ghazi Bulk WH"},{"code":"513446","name":"Taj Chowk Bulk WH"},{"code":"513449","name":"Hajveri Bulk WH"},{"code":"513450","name":"Tillu Road Bulk WH"},{"code":"513451","name":"Mehmoodabad Bulk WH"},{"code":"520103","name":"GHOTKI-2"},{"code":"520105","name":"GHOTKI BULK WH"}],"SUKKUR":[{"code":"520200","name":"ROHRI-2"},{"code":"520204","name":"PANNU AAQIL-1 WH"},{"code":"520206","name":"SALEHPAT WH"},{"code":"520207","name":"ROHRI-3 WH"},{"code":"520208","name":"Sukkur Industrial WH"},{"code":"520303","name":"Dera Murad Jamali WH"},{"code":"520402","name":"KHUMB WH"},{"code":"520406","name":"SITHARJA WH"},{"code":"520501","name":"SHIKAR PUR WH"},{"code":"520605","name":"Larkana WH"},{"code":"520705","name":"MEHAR WH"},{"code":"520801","name":"MORO WH"},{"code":"520809","name":"Mehrabpur-3 WH"},{"code":"520810","name":"BHIRIA ROAD-2 WH"},{"code":"530203","name":"QUETTA2 WH"},{"code":"530205","name":"QUETTA-3 WH"},{"code":"531001","name":"KHUZDAR1 WH"}]}};

const zoneSelect = document.getElementById("zone");
const regionSelect = document.getElementById("region");
const warehouseSelect = document.getElementById("location");

window.onload = function() {
    for (let zone in warehouseData) {
        let option = document.createElement("option"); option.value = zone; option.textContent = zone; zoneSelect.appendChild(option);
    }
};

zoneSelect.addEventListener("change", function() {
    regionSelect.innerHTML = '<option value="">Select Region...</option>';
    warehouseSelect.innerHTML = '<option value="">Select Warehouse...</option>';
    let selectedZone = this.value;
    if (selectedZone) {
        for (let region in warehouseData[selectedZone]) {
            let option = document.createElement("option"); option.value = region; option.textContent = region; regionSelect.appendChild(option);
        }
    }
});

regionSelect.addEventListener("change", function() {
    warehouseSelect.innerHTML = '<option value="">Select Warehouse...</option>';
    let selectedZone = zoneSelect.value; let selectedRegion = this.value;
    if (selectedZone && selectedRegion) {
        warehouseData[selectedZone][selectedRegion].forEach(function(wh) {
            let option = document.createElement("option"); option.value = wh.code + " - " + wh.name; option.textContent = wh.code + " - " + wh.name; warehouseSelect.appendChild(option);
        });
    }
});

document.getElementById('shipment-purpose').addEventListener('change', function() {
    const bothDiv = document.getElementById('both-quantities');
    if (this.value === 'Both') {
        bothDiv.style.display = 'flex';
        document.getElementById('containment-qty').required = true;
        document.getElementById('diversion-qty').required = true;
    } else {
        bothDiv.style.display = 'none';
        document.getElementById('containment-qty').required = false;
        document.getElementById('diversion-qty').required = false;
    }
});

// --- 2. FORM SUBMISSION LOGIC ---
const salesForm = document.getElementById('sales-form');
const submitBtn = document.querySelector('.submit-btn');

salesForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let purpose = document.getElementById('shipment-purpose').value;
    let totalQty = parseFloat(document.getElementById('qty').value) || 0;
    let contQty = 0; let divQty = 0;

    if (purpose === 'Both') {
        contQty = parseFloat(document.getElementById('containment-qty').value) || 0;
        divQty = parseFloat(document.getElementById('diversion-qty').value) || 0;
        if ((contQty + divQty) > totalQty) {
            showToast("Error: Containment + Diversion Qty cannot exceed Total Qty!", "error");
            return; 
        }
    }

    submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';
    submitBtn.disabled = true;

    const date = new Date();
    const dateString = date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
    const uniqueId = "FAT-" + dateString + "-" + (Math.floor(Math.random() * 900) + 100);

    const payload = {
        uid: uniqueId, productType: document.getElementById('product').value, dailyQty: document.getElementById('qty').value, 
        location: document.getElementById('location').value, zone: document.getElementById('zone').value, region: document.getElementById('region').value,
        shipmentType: document.getElementById('shipment-type').value, stage: "01. Pending RDM Approval",
        dailyRequirement: document.getElementById('daily-req').value, shipmentPurpose: purpose, containmentQty: contQty, diversionQty: divQty
    };

    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(() => {
        showToast("Success! ID: " + uniqueId + " sent for RDM Approval.", "success");
        salesForm.reset(); document.getElementById('both-quantities').style.display = 'none'; 
        regionSelect.innerHTML = '<option value="">Select Region...</option>'; warehouseSelect.innerHTML = '<option value="">Select Warehouse...</option>';
    }).catch(() => { showToast("Error saving request.", "error"); }).finally(() => { submitBtn.textContent = 'Submit Request'; submitBtn.disabled = false; });
});

// --- 3. RDM APPROVAL & REJECTION LOGIC ---
const approveBody = document.getElementById('approve-body');
document.getElementById('btn-approve').addEventListener('click', function() {
    approveBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading RDM approvals...</td></tr>';
    fetch(GOOGLE_SCRIPT_URL).then(r => r.json()).then(data => {
        approveBody.innerHTML = ''; 
        const rdmShipments = data.data.filter(s => {
            if ((s.Stage || s.stage) !== "01. Pending RDM Approval") return false;
            if (currentUserRole === "Super Admin") return true;
            if (currentUserRole.includes("Regional Distribution Manager")) {
                let userRegion = currentUserRole.replace("Regional Distribution Manager ", "").trim().toUpperCase();
                return (s.Region || s.region || "").toUpperCase() === userRegion;
            } return false;
        });
        
        if (rdmShipments.length === 0) { approveBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No pending approvals!</td></tr>'; return; }

        rdmShipments.forEach(shipment => {
            let uid = shipment.UID || shipment.uid;
            let type = shipment.Shipment_Type || shipment.shipmentType || "Plant Shipment";
            let prodDisplay = type === "Transshipment" ? `${shipment.Product_Type}<br><small style="color:#d35400;font-weight:bold;">[Transshipment]</small>` : shipment.Product_Type;
            let shortLoc = (shipment.Warehouse_Location || shipment.location).split(" - ")[0];

            // NEW: Parse and display Purpose
            let purposeDisplay = shipment.Shipment_Purpose || shipment.shipmentPurpose || "N/A";
            if (purposeDisplay === "Both") {
                let cq = shipment.Containment_Qty || shipment.containmentQty || 0; 
                let dq = shipment.Diversion_Qty || shipment.diversionQty || 0;
                purposeDisplay = `Both<br><small>(Cont: ${cq} | Div: ${dq})</small>`;
            }

            approveBody.innerHTML += `<tr>
                <td><strong>${uid}</strong></td><td>${prodDisplay}</td><td>${shipment.Daily_Qty}</td><td>${shortLoc}</td>
                <td>${purposeDisplay}</td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <input type="text" id="remark-rdm-${uid}" placeholder="Remarks (Required for Rejection)" style="padding:4px; font-size:0.8rem; border-radius:4px; border:1px solid #ccc;">
                        <div style="display:flex; gap:6px;">
                            <button onclick="approveRDM('${uid}')" style="background:#1a5c3a; color:white; border:none; padding:6px; border-radius:4px; font-weight:bold; cursor:pointer; flex:1;">Approve</button>
                            <button onclick="rejectRDM('${uid}')" style="background:#dc3545; color:white; border:none; padding:6px; border-radius:4px; font-weight:bold; cursor:pointer; flex:1;">Reject</button>
                        </div>
                    </div>
                </td>
            </tr>`;
        });
    });
});

window.approveRDM = function(uid) {
    let rem = document.getElementById(`remark-rdm-${uid}`).value || "Approved without remarks";
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "02. Coordinator Queue", remarks: rem }) })
    .then(() => { showToast(`Shipment ${uid} approved!`, "success"); setTimeout(() => document.getElementById('btn-approve').click(), 1500); });
};

window.rejectRDM = function(uid) {
    let rem = document.getElementById(`remark-rdm-${uid}`).value;
    if (!rem) { alert("Please provide a remark explaining the rejection."); return; }
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "Rejected", remarks: rem }) })
    .then(() => { showToast(`Shipment ${uid} Rejected.`, "error"); setTimeout(() => document.getElementById('btn-approve').click(), 1500); });
};

// --- 4. ZONAL COORDINATOR QUEUE & REJECTION ---
const queueBody = document.getElementById('queue-body');
document.getElementById('btn-queue').addEventListener('click', function() {
    queueBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading queue...</td></tr>';
    fetch(GOOGLE_SCRIPT_URL).then(r => r.json()).then(data => {
        queueBody.innerHTML = ''; 
        const pendingShipments = data.data.filter(s => {
            if ((s.Stage || s.stage) !== "02. Coordinator Queue") return false;
            if (currentUserRole === "Super Admin") return true;
            if (currentUserRole.includes("Zonal Sales Coordinator")) {
                let userZone = currentUserRole.replace("Zonal Sales Coordinator ", "").trim().toUpperCase();
                return (s.Zone || s.zone || "").toUpperCase().includes(userZone);
            } return false;
        });
        
        if (pendingShipments.length === 0) { queueBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending requests!</td></tr>'; return; }

        pendingShipments.forEach(shipment => {
            let uid = shipment.UID || shipment.uid;
            let type = shipment.Shipment_Type || shipment.shipmentType || "Plant Shipment";
            let prodDisplay = type === "Transshipment" ? `${shipment.Product_Type}<br><small style="color:#d35400;font-weight:bold;">[Transshipment]</small>` : shipment.Product_Type;

            let actionCol = "";
            if (type === "Transshipment") {
                actionCol = `
                    <td>
                        <em style="display:block; margin-bottom:6px;">Route to WH Officer</em>
                        <input type="text" id="remark-coord-${uid}" placeholder="Remarks (Required for Rejection)" style="padding:4px; font-size:0.8rem; width:100%; border-radius:4px; border:1px solid #ccc;">
                    </td>
                    <td>
                        <div style="display:flex; gap:6px; flex-direction:column;">
                            <button onclick="routeTransshipment('${uid}')" style="background:#d35400; color:white; border:none; padding:6px; border-radius:4px; font-weight:bold; cursor:pointer;">Route</button>
                            <button onclick="rejectCoord('${uid}')" style="background:#dc3545; color:white; border:none; padding:6px; border-radius:4px; font-weight:bold; cursor:pointer;">Reject</button>
                        </div>
                    </td>`;
            } else {
                actionCol = `
                    <td>
                        <select id="plant-select-${uid}" style="padding:4px; font-size:0.8rem; margin-bottom:6px; width:100%; border-radius:4px;"><option value="">Select Plant...</option><option value="Sadiqabad Plant">Sadiqabad Plant</option><option value="Multan Plant">Multan Plant</option><option value="Sheikhupura Plant">Sheikhupura Plant</option></select>
                        <input type="text" id="remark-coord-${uid}" placeholder="Remarks (Required for Rejection)" style="padding:4px; font-size:0.8rem; width:100%; border-radius:4px; border:1px solid #ccc;">
                    </td>
                    <td>
                        <div style="display:flex; gap:6px; flex-direction:column;">
                            <button onclick="assignPlant('${uid}')" style="background:#f9a826; border:none; padding:6px; border-radius:4px; font-weight:bold; cursor:pointer;">Assign</button>
                            <button onclick="rejectCoord('${uid}')" style="background:#dc3545; color:white; border:none; padding:6px; border-radius:4px; font-weight:bold; cursor:pointer;">Reject</button>
                        </div>
                    </td>`;
            }
            queueBody.innerHTML += `<tr><td><strong>${uid}</strong></td><td>${prodDisplay}</td><td>${shipment.Daily_Qty}</td>${actionCol}</tr>`;
        });
    });
});

window.assignPlant = function(uid) {
    const p = document.getElementById(`plant-select-${uid}`).value;
    let rem = document.getElementById(`remark-coord-${uid}`).value || "Assigned without remarks";
    if (!p) { alert("Select a Plant!"); return; }
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "03. Plant Fulfillment", assignedPlant: p, remarks: rem }) })
    .then(() => { showToast(`Assigned ${uid} to ${p}!`, "success"); setTimeout(() => document.getElementById('btn-queue').click(), 1500); });
};

window.routeTransshipment = function(uid) {
    let rem = document.getElementById(`remark-coord-${uid}`).value || "Routed without remarks";
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "03. WH Transshipment", assignedPlant: "Transshipment", remarks: rem }) })
    .then(() => { showToast(`Routed ${uid} to WH Officer!`, "success"); setTimeout(() => document.getElementById('btn-queue').click(), 1500); });
};

window.rejectCoord = function(uid) {
    let rem = document.getElementById(`remark-coord-${uid}`).value;
    if (!rem) { alert("Please provide a remark explaining the rejection."); return; }
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "Rejected", remarks: rem }) })
    .then(() => { showToast(`Shipment ${uid} Rejected.`, "error"); setTimeout(() => document.getElementById('btn-queue').click(), 1500); });
};

// --- 5. PLANT FULFILLMENT LOGIC ---
const plantBody = document.getElementById('plant-body');
document.getElementById('btn-plant').addEventListener('click', function() {
    plantBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading plant assignments...</td></tr>';
    fetch(GOOGLE_SCRIPT_URL).then(r => r.json()).then(data => {
        plantBody.innerHTML = ''; 
        const plantShipments = data.data.filter(s => {
            if ((s.Stage || s.stage) !== "03. Plant Fulfillment") return false;
            if ((s.Shipment_Type || s.shipmentType) === "Transshipment") return false; 
            if (currentUserRole === "Super Admin") return true;
            if (currentUserRole.includes("Plant Logistics")) {
                let userPlantCity = currentUserRole.split(" ").pop().toUpperCase();
                return (s.Assigned_Plant || s.assignedPlant || "").toUpperCase().includes(userPlantCity);
            } return false;
        });
        
        if (plantShipments.length === 0) { plantBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending loads!</td></tr>'; return; }

        plantShipments.forEach(s => {
            let uid = s.UID || s.uid;
            plantBody.innerHTML += `<tr><td><strong>${uid}</strong></td><td>${s.Product_Type}</td><td>${s.Daily_Qty}</td>
                <td><input type="date" id="batch-date-${uid}" style="padding: 6px; font-size: 0.9rem; width: 100%;"></td>
                <td><button onclick="dispatchPlant('${uid}')" style="background:#1a5c3a; color:white; border:none; padding:8px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">Dispatch</button></td>
            </tr>`;
        });
    });
});

window.dispatchPlant = function(uid) {
    if (!document.getElementById(`batch-date-${uid}`).value) { alert("Enter Batch Date!"); return; }
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "05. Disbursement" }) })
    .then(() => { showToast(`Shipment ${uid} dispatched!`, "success"); setTimeout(() => document.getElementById('btn-plant').click(), 1500); });
};

// --- 6. WH TRANSSHIPMENT LOGIC ---
const tsBody = document.getElementById('transshipment-body');
document.getElementById('btn-transshipment').addEventListener('click', function() {
    tsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading transshipments...</td></tr>';
    fetch(GOOGLE_SCRIPT_URL).then(r => r.json()).then(data => {
        tsBody.innerHTML = ''; 
        const tsShipments = data.data.filter(s => {
            let stage = s.Stage || s.stage || "";
            if ((s.Shipment_Type || s.shipmentType) !== "Transshipment") return false;
            
            if (currentUserRole === "Super Admin") return stage === "03. WH Transshipment" || stage === "04. Transshipment Quotation";
            if (currentUserRole === "WH Transshipment Officer") return stage === "03. WH Transshipment";
            if (currentUserRole.includes("Plant Logistics")) return stage === "04. Transshipment Quotation"; // Global Visibility for all plants
            return false;
        });
        
        if (tsShipments.length === 0) { tsBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No pending transshipments!</td></tr>'; return; }

        let whOptions = '<option value="">Select Source WH...</option>';
        let allWHs = [];
        for (let z in warehouseData) { for (let r in warehouseData[z]) { warehouseData[z][r].forEach(w => allWHs.push(w.code + " - " + w.name)); } }
        allWHs.sort().forEach(w => { whOptions += `<option value="${w}">${w}</option>`; });

        tsShipments.forEach(s => {
            let uid = s.UID || s.uid;
            let destLoc = (s.Warehouse_Location || s.location).split(" - ")[0];
            let stage = s.Stage || s.stage;
            let srcWh = s.Source_WH || s.sourceWh || "Pending";
            
            let sourceHtml = ""; let actionHtml = "";
            if (stage === "03. WH Transshipment") {
                sourceHtml = `<select id="src-wh-${uid}" style="width:100%; padding:4px;">${whOptions}</select>`;
                actionHtml = `<button onclick="assignSourceWh('${uid}')" style="background:#f9a826; border:none; padding:8px; border-radius:4px; font-weight:bold; cursor:pointer;">Assign Source</button>`;
            } else if (stage === "04. Transshipment Quotation") {
                sourceHtml = `<strong>${srcWh.split(" - ")[0]}</strong>`; 
                // NEW: Transshipment action changed to "Accept Request" instead of Dispatch
                actionHtml = `<button onclick="acceptTransshipment('${uid}')" style="background:#17a2b8; color:white; border:none; padding:8px; border-radius:4px; font-weight:bold; cursor:pointer;">Accept Request</button>`;
            }

            tsBody.innerHTML += `<tr><td><strong>${uid}</strong></td><td>${s.Product_Type}</td><td>${s.Daily_Qty}</td><td>${destLoc}</td><td>${sourceHtml}</td><td>${actionHtml}</td></tr>`;
        });
    });
});

window.assignSourceWh = function(uid) {
    const src = document.getElementById(`src-wh-${uid}`).value;
    if (!src) { alert("Select a Source Warehouse!"); return; }
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "04. Transshipment Quotation", sourceWh: src }) })
    .then(() => { showToast(`Assigned ${src} to ${uid}!`, "success"); setTimeout(() => document.getElementById('btn-transshipment').click(), 1500); });
};

// NEW: Accept Request Action
window.acceptTransshipment = function(uid) {
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "update", uid: uid, stage: "05. Disbursement" }) })
    .then(() => { showToast(`Transshipment ${uid} Accepted!`, "success"); setTimeout(() => document.getElementById('btn-transshipment').click(), 1500); });
};

// --- 7. ID TRACKER LOGIC (Shows Remarks & Rejection Badge) ---
const trackerBody = document.getElementById('tracker-body');
document.getElementById('btn-tracker').addEventListener('click', function() {
    trackerBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading live data...</td></tr>';
    fetch(GOOGLE_SCRIPT_URL).then(r => r.json()).then(data => {
        trackerBody.innerHTML = ''; 
        data.data.reverse().forEach(s => {
            let uid = s.UID || s.uid || "N/A";
            let type = s.Shipment_Type || s.shipmentType || "Plant Shipment";
            let prodDisplay = type === "Transshipment" ? `${s.Product_Type}<br><small style="color:#d35400;">[Transshipment]</small>` : s.Product_Type;
            let shortLoc = (s.Warehouse_Location || s.location || "N/A").split(" - ")[0];
            
            // Rejection Badge & Remarks
            let stageBadge = (s.Stage || s.stage) === "Rejected" ? `<span class="stage-badge" style="background:#dc3545; color:white;">Rejected</span>` : `<span class="stage-badge">${s.Stage || s.stage}</span>`;
            let remarksDisplay = s.Remarks || s.remarks || "-";

            trackerBody.innerHTML += `<tr><td><strong>${uid}</strong></td><td>${prodDisplay}</td><td>${s.Daily_Qty}</td><td>${shortLoc}</td><td><small>${remarksDisplay}</small></td><td>${stageBadge}</td></tr>`;
        });
    });
});

// --- 8. DASHBOARD LOGIC (WITH SLA / TAT CALCULATION) ---
const dashboardBody = document.getElementById('dashboard-body');
document.getElementById('btn-dashboard').addEventListener('click', function() {
    dashboardBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Loading records...</td></tr>';
    fetch(GOOGLE_SCRIPT_URL).then(r => r.json()).then(data => {
        let prodTotals = {}; let regTotals = {};
        
        data.data.forEach(s => {
            let prod = s.Product_Type || s.productType || "Unknown";
            let shortLoc = (s.Warehouse_Location || s.location || "Unknown").split(" - ")[0];
            let qty = parseFloat(s.Daily_Qty || s.dailyQty) || 0;
            if(!prodTotals[prod]) prodTotals[prod] = 0; prodTotals[prod] += qty;
            if(!regTotals[shortLoc]) regTotals[shortLoc] = 0; regTotals[shortLoc] += qty;
        });

        if(prodChartInstance) prodChartInstance.destroy();
        prodChartInstance = new Chart(document.getElementById('productChart'), { type: 'doughnut', data: { labels: Object.keys(prodTotals), datasets: [{ data: Object.values(prodTotals), backgroundColor: ['#1a5c3a', '#f9a826', '#28a745', '#17a2b8', '#6c757d', '#dc3545'] }] }, options: { maintainAspectRatio: false } });

        if(regChartInstance) regChartInstance.destroy();
        regChartInstance = new Chart(document.getElementById('regionChart'), { type: 'bar', data: { labels: Object.keys(regTotals), datasets: [{ label: 'Total Tons', data: Object.values(regTotals), backgroundColor: '#1a5c3a' }] }, options: { maintainAspectRatio: false } });

        dashboardBody.innerHTML = ''; 
        const disbursedShipments = data.data.filter(s => (s.Stage || s.stage) === "05. Disbursement");
        if (disbursedShipments.length === 0) { dashboardBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No completed shipments yet!</td></tr>'; return; }

        disbursedShipments.reverse().forEach(s => {
            let uid = s.UID || s.uid;
            let type = s.Shipment_Type || s.shipmentType || "Plant Shipment";
            let destLoc = (s.Warehouse_Location || s.location || "N/A").split(" - ")[0];
            let dailyReq = s.Daily_Requirement || s.dailyRequirement || "N/A";
            let sourceLoc = type === "Transshipment" ? (s.Source_WH || s.sourceWh || "").split(" - ")[0] : (s.Assigned_Plant || s.assignedPlant || "Plant");
            
            let purposeDisplay = s.Shipment_Purpose || s.shipmentPurpose || "N/A";
            if (purposeDisplay === "Both") {
                let cq = s.Containment_Qty || s.containmentQty || 0; let dq = s.Diversion_Qty || s.diversionQty || 0;
                purposeDisplay = `Both (Cont: ${cq} | Div: ${dq})`;
            }

            // DYNAMIC TAT CALCULATION
            let initTime = new Date(s.Timestamp || s.timestamp);
            let dispTime = new Date(s.Dispatch_Time || s.dispatchTime || s.Dispatch_Time); 
            let tatDisplay = "N/A";
            if (initTime.toString() !== "Invalid Date" && dispTime.toString() !== "Invalid Date") {
                let diffHours = Math.abs(dispTime - initTime) / 36e5; // Convert milliseconds to hours
                tatDisplay = diffHours.toFixed(1);
            }

            dashboardBody.innerHTML += `<tr>
                <td><strong>${uid}</strong></td><td>${type}</td><td>${destLoc}</td><td>${s.Product_Type}</td>
                <td>${s.Daily_Qty}</td><td>${dailyReq}</td><td>${sourceLoc}</td><td>${purposeDisplay}</td>
                <td><strong>${tatDisplay}</strong></td><td><span class="stage-badge" style="background:#28a745; color:white;">Completed</span></td>
            </tr>`;
        });
    });
});

// --- SEARCH & EXPORT ---
document.getElementById('search-tracker').addEventListener('keyup', function() {
    let filter = this.value.toLowerCase();
    document.querySelectorAll('#tracker-body tr').forEach(row => row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none');
});

document.getElementById('export-csv').addEventListener('click', function() {
    let csv = [];
    document.querySelectorAll('#dashboard-table tr').forEach(row => {
        let cols = row.querySelectorAll('td, th'); let rowData = [];
        cols.forEach(c => rowData.push('"' + c.innerText.replace(/"/g, '""') + '"'));
        csv.push(rowData.join(','));
    });
    let a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.join('\n')); a.download = 'Disbursement_Report.csv'; a.click();
});

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
}