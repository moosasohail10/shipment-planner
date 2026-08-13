// Paste your Google Apps Script URL here between the quotes!
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzE97nuElYbx_KKgSYqOj_GQSiLx5S4zPmVOsaO-Vf00cc0681UNnaBhdbCMEUWkMIT/exec'; // (Keep your actual URL here!)

let prodChartInstance = null;
let regChartInstance = null;
let currentUserRole = ""; // Stores the user's role to enable Row-Level Security filtering

// --- 0. LOGIN & ROLE ACCESS LOGIC ---
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const loginBtn = document.getElementById('login-btn');
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    loginBtn.innerHTML = '<span class="spinner"></span>Verifying...';
    loginBtn.disabled = true;

    const payload = {
        action: "login",
        username: document.getElementById('login-user').value,
        password: document.getElementById('login-pass').value
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === "success") {
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
            
            currentUserRole = data.role; // Save the role globally for data filtering
            applyRoleAccess(data.role);
            showToast(`Welcome! Logged in as: ${data.role}`, "success");
        } else {
            loginMessage.style.color = "red";
            loginMessage.textContent = "Invalid Username or Password";
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    })
    .catch(error => {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Connection error. Please try again.";
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
    });
});

function applyRoleAccess(role) {
    // Hide all tabs by default
    const allTabs = ['btn-request', 'btn-approve', 'btn-tracker', 'btn-queue', 'btn-plant', 'btn-dashboard'];
    allTabs.forEach(id => document.getElementById(id).style.display = 'none');

    // Super Admin: Sees everything
    if (role === "Super Admin") {
        allTabs.forEach(id => document.getElementById(id).style.display = 'inline-block');
        document.getElementById('btn-request').click(); 
    }
    // RDM (Approval Workflow): Sees Request, Approval Queue, Tracker, Dashboard
    else if (role.includes("Regional Distribution Manager")) {
        document.getElementById('btn-request').style.display = 'inline-block';
        document.getElementById('btn-approve').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block';
        document.getElementById('btn-dashboard').style.display = 'inline-block';
        document.getElementById('btn-approve').click(); 
    } 
    // District / Regional Sales Manager: Sees Request, Tracker, Dashboard
    else if (role === "District Sales Manager" || role === "Regional Sales Manager") {
        document.getElementById('btn-request').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block';
        document.getElementById('btn-dashboard').style.display = 'inline-block';
        document.getElementById('btn-request').click(); 
    } 
    // Zonal Coordinator: Sees Coordinator Queue, Tracker, Dashboard
    else if (role.includes("Zonal Sales Coordinator")) {
        document.getElementById('btn-queue').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block';
        document.getElementById('btn-dashboard').style.display = 'inline-block';
        document.getElementById('btn-queue').click(); 
    } 
    // Plant Teams: Sees Plant Fulfillment, Tracker, Dashboard
    else if (role.includes("Plant Logistics")) {
        document.getElementById('btn-plant').style.display = 'inline-block';
        document.getElementById('btn-tracker').style.display = 'inline-block'; 
        document.getElementById('btn-dashboard').style.display = 'inline-block'; 
        document.getElementById('btn-plant').click(); 
    } 
    else {
        alert("Role not recognized. Please contact admin.");
    }
}

// --- LOGOUT LOGIC ---
document.getElementById('btn-logout').addEventListener('click', function() {
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('login-form').reset();
    document.getElementById('login-message').textContent = '';
    const allTabs = ['btn-request', 'btn-approve', 'btn-tracker', 'btn-queue', 'btn-plant', 'btn-dashboard'];
    allTabs.forEach(id => document.getElementById(id).style.display = 'none');
    currentUserRole = ""; // Clear session memory
});

// --- 1. TAB NAVIGATION LOGIC ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.id.replace('btn-', 'tab-');
        document.getElementById(targetId).classList.add('active');
    });
});

// --- 2. CASCADING DROPDOWN LOGIC ---
const warehouseData = {"CENTER (ZONE)":{"BAHAWALPUR":[{"code":"512700","name":"LODHRAN BULK WH"},{"code":"512718","name":"LODHRAN3 WH"},{"code":"512719","name":"KEHROR PACCA 4 WH"},{"code":"512721","name":"LODHRAN-4 WH"},{"code":"513201","name":"HASILPUR WH"},{"code":"513204","name":"YAZMAN WH"},{"code":"513212","name":"NOORPUR NAURANGA 2 WH"},{"code":"513214","name":"BAHAWALPUR4 WH"},{"code":"513218","name":"BAHAWALPUR-7 WH"},{"code":"513219","name":"BAHAWALPUR-8 WH"},{"code":"513221","name":"Bahawalpur-10 WH"},{"code":"513222","name":"Bahawalpur-11 WH"},{"code":"513223","name":"Samma Satta Bulk WH"},{"code":"513302","name":"BAHAWALNAGAR WH"},{"code":"513307","name":"CHISHTIAN WH-3"},{"code":"513310","name":"Minchinabad-2 WH"},{"code":"513311","name":"Fort Abbas-2 WH"},{"code":"513312","name":"Khichiwala WH"}],"D.G.KHAN":[{"code":"512101","name":"BHAKKAR WH"},{"code":"512102","name":"Bhakkar 2 WH"},{"code":"512801","name":"LAYYAH WH"},{"code":"512803","name":"KAROR LAL ESAN WH"},{"code":"512804","name":"Qaziabad WH"},{"code":"512901","name":"JATOI WH"},{"code":"512902","name":"KOT ADDU WH"},{"code":"512907","name":"Pathan Hotel WH"},{"code":"512908","name":"MUZAFFARGARH BULK WH"},{"code":"512909","name":"Langar Sarai WH"},{"code":"512910","name":"Adda Basira WH"},{"code":"512912","name":"Muzaffargarh 4 WH"},{"code":"513001","name":"D.G. KHAN WH"},{"code":"513002","name":"BAGGA SHER WH"},{"code":"513004","name":"TAUNSA WH"},{"code":"513006","name":"DG Khan Bulk WH"},{"code":"513101","name":"JAMPUR WH"},{"code":"513103","name":"Fazilpur WH"},{"code":"513104","name":"RAJANPUR-2 WH"},{"code":"545802","name":"D.I.KHAN WH 2"}],"MULTAN":[{"code":"512400","name":"BUREWALA BULK WH"},{"code":"512403","name":"VEHARI WH"},{"code":"512404","name":"GAGO MANDI WH"},{"code":"512407","name":"MAILSI-3 WH"},{"code":"512415","name":"ADDA ZAHEER NAGAR WH"},{"code":"512417","name":"Mailsi Bulk WH"},{"code":"512501","name":"MIANCHANU WH"},{"code":"512502","name":"KHANEWAL WH"},{"code":"512506","name":"MIANCHANNU 2 WH"},{"code":"512507","name":"KHANEWAL-2 WH"},{"code":"512508","name":"MIAN CHANNU-3 WH"},{"code":"512510","name":"Batti Bangla WH"},{"code":"512511","name":"PULL-14 WH"},{"code":"512600","name":"MULTAN 2 WH"},{"code":"512601","name":"MULTAN WH"},{"code":"512615","name":"CHOWK MAITLA WH"},{"code":"512620","name":"Multan Bulk - 11"},{"code":"512624","name":"JALALPUR PIRWALA WH"},{"code":"512628","name":"ADDA SADIQ WALA BULK 2 WH"},{"code":"512629","name":"MULTAN BULK 12 WH"},{"code":"512630","name":"MULTAN 13 WH"},{"code":"512633","name":"JALALPUR PIRWALA-2 WH"},{"code":"512635","name":"MULTAN 16 WH"},{"code":"512636","name":"MULTAN 17 BULK WH"},{"code":"512637","name":"MULTAN 18 WH"},{"code":"512638","name":"ADDA SADIQ WALA BULK 3 WH"},{"code":"512639","name":"MULTAN 20 WH"},{"code":"512640","name":"MULTAN 22 WH"},{"code":"512641","name":"MULTAN 21 WH"},{"code":"512642","name":"Multan 23 WH"},{"code":"512643","name":"Multan Bulk-25 WH"},{"code":"512644","name":"Multan-24 WH"},{"code":"512645","name":"Multan-26 WH"},{"code":"512647","name":"INDUSTRIAL AREA MULTAN-2 WH"},{"code":"512648","name":"Kayanpur Chowk WH"},{"code":"512649","name":"Industrial Area Multan-3 WH"},{"code":"512650","name":"ADDA LAR WH"},{"code":"512651","name":"Tatepur WH"},{"code":"512652","name":"Qadirpur Ran WH"},{"code":"512653","name":"Industrial Area Multan-4 WH"},{"code":"512654","name":"Chowk BCG WH"},{"code":"512655","name":"Qadirpur Ran-2 WH"},{"code":"512656","name":"JALALPUR PIRWALA - 3 WH"},{"code":"512657","name":"Industrial Area Multan-5 WH"},{"code":"512658","name":"CHOWK NAG SHAH-3 WH"},{"code":"512660","name":"Adda Lar-3 WH"},{"code":"512661","name":"Industrial Area Multan-6 WH"},{"code":"512662","name":"ADDA LAR-4 WH"},{"code":"512663","name":"CHOWK NAG SHAH-4 WH"},{"code":"512664","name":"NLC ByPass WH"},{"code":"512665","name":"Industrial Area Multan-7 WH"},{"code":"512666","name":"Munirabad Bulk WH"},{"code":"512667","name":"Multan Bulk 27 WH"},{"code":"512668","name":"Multan Bulk 28 WH"},{"code":"512669","name":"Multan Bulk 29 WH"},{"code":"512670","name":"Qadirpur Ran-3 WH"},{"code":"512671","name":"Multan Bulk 30 WH"},{"code":"512672","name":"Adda Gopalpur WH"},{"code":"512673","name":"Industrial Area Multan-08 WH"},{"code":"512674","name":"Pakarab Plant WH"}]},"NORTH (ZONE)":{"FAISALABAD":[{"code":"510201","name":"CHINIOT-2 WH"},{"code":"510801","name":"MANDI BAHAUDIN WH"},{"code":"511603","name":"CHINIOT WH"},{"code":"511612","name":"JHANG 4 WH"},{"code":"511613","name":"Jhang 5 WH"},{"code":"511701","name":"JARANWALA WH"},{"code":"511703","name":"SAMUNDRI 2 WH"},{"code":"511709","name":"FAISALABAD-2 WH"},{"code":"511710","name":"FAISALABAD INDUSTRIAL ESTATE WH"},{"code":"511801","name":"SARGODHA WH"},{"code":"511802","name":"BHALWAL WH"},{"code":"511805","name":"MIANWALI WH"}],"ISLAMABAD":[{"code":"510102","name":"Faqirabad-3 WH"},{"code":"540802","name":"Baffa Duraha-2 WH"},{"code":"541304","name":"MARDAN3 WH"},{"code":"541604","name":"Peshawar 4 WH"}],"LAHORE":[{"code":"510605","name":"Eminabad WH"},{"code":"510701","name":"DASKA WH"},{"code":"510901","name":"NAROWAL WH"},{"code":"511001","name":"HAFIZABAD WH"},{"code":"511002","name":"Pindi Bhattian WH"},{"code":"511202","name":"KHORI LHR WH"},{"code":"511204","name":"Sarsabz Retail Outlet Sharqpur"},{"code":"511302","name":"PATTOKI WH"},{"code":"511303","name":"KASUR WH"},{"code":"511307","name":"ELLAHABAD-2 WH"},{"code":"513501","name":"MANDI FAIZABAD WH"},{"code":"513502","name":"SHAHKOT WH"},{"code":"536001","name":"DH-WH"}],"SAHIWAL":[{"code":"511401","name":"OKARA WH"},{"code":"511402","name":"DEPALPUR WH"},{"code":"511406","name":"OKARA BULK WH"},{"code":"511408","name":"HAVAILI LAKHA-2 WH"},{"code":"511409","name":"Okara-2 WH"},{"code":"511505","name":"GOJRA BULK WH"},{"code":"511507","name":"T.T.SINGH WH2"},{"code":"511508","name":"T.T Singh-3 WH"},{"code":"512201","name":"SAHIWAL WH"},{"code":"512202","name":"HARAPPA WH"},{"code":"512205","name":"90-Morr WH"},{"code":"512206","name":"ADDA GHAZIABAD WH"},{"code":"512207","name":"CHICHAWATNI-2 WH"},{"code":"512208","name":"Qadirabad WH"},{"code":"512301","name":"PAKPATTAN WH"},{"code":"512302","name":"ARIFWALA WH"},{"code":"512305","name":"Pakpattan Bulk WH"}]},"SOUTH (ZONE)":{"HYDERABAD":[{"code":"520902","name":"NAWABSHAH WH"},{"code":"521001","name":"SHAHDADPUR WH"},{"code":"521002","name":"KHIPRO WH"},{"code":"521103","name":"MIRPURKHAS-3 WH"},{"code":"521201","name":"TANDO ALLAH YAR WH"},{"code":"521501","name":"MATLI WH"},{"code":"521506","name":"GOLARCHI-2 WH"},{"code":"521602","name":"THATTA WH"},{"code":"521802","name":"HALA 2"},{"code":"521804","name":"Hala-3 WH"},{"code":"522501","name":"TANDO ALLAH YAR-2 WH"},{"code":"532601","name":"HUB CHOWKI WH"},{"code":"890002","name":"Qazi WH"}],"R.Y.KHAN":[{"code":"513202","name":"AHMED PUR EAST WH"},{"code":"513400","name":"SADIQABAD BULK WH"},{"code":"513401","name":"RAHIM YAR KHAN WH"},{"code":"513402","name":"KHANPUR WH"},{"code":"513404","name":"LIAQATPUR WH"},{"code":"513406","name":"Rahim Yar Khan WH - 2"},{"code":"513409","name":"RAHIM YAR KHAN - 3 WH"},{"code":"513415","name":"RYK BULK WAREHOUSE"},{"code":"513427","name":"KHANPUR-2 WH"},{"code":"513432","name":"SADIQABAD BULK-2 WH"},{"code":"513435","name":"SADIQABAD BULK-3 WH"},{"code":"513439","name":"Thali Chowk Bulk WH"},{"code":"513440","name":"Sardar Garh Bulk WH"},{"code":"513441","name":"Akramabad Bulk WH"},{"code":"513442","name":"Hussain Abad Bulk WH"},{"code":"513443","name":"Basti Malikpur Bulk WH"},{"code":"513444","name":"Waahi Shah Bulk WH"},{"code":"513445","name":"Al-Ghazi Bulk WH"},{"code":"513446","name":"Taj Chowk Bulk WH"},{"code":"513449","name":"Hajveri Bulk WH"},{"code":"513450","name":"Tillu Road Bulk WH"},{"code":"513451","name":"Mehmoodabad Bulk WH"},{"code":"520103","name":"GHOTKI-2"},{"code":"520105","name":"GHOTKI BULK WH"}],"SUKKUR":[{"code":"520200","name":"ROHRI-2"},{"code":"520204","name":"PANNU AAQIL-1 WH"},{"code":"520206","name":"SALEHPAT WH"},{"code":"520207","name":"ROHRI-3 WH"},{"code":"520208","name":"Sukkur Industrial WH"},{"code":"520303","name":"Dera Murad Jamali WH"},{"code":"520402","name":"KHUMB WH"},{"code":"520406","name":"SITHARJA WH"},{"code":"520501","name":"SHIKAR PUR WH"},{"code":"520605","name":"Larkana WH"},{"code":"520705","name":"MEHAR WH"},{"code":"520801","name":"MORO WH"},{"code":"520809","name":"Mehrabpur-3 WH"},{"code":"520810","name":"BHIRIA ROAD-2 WH"},{"code":"530203","name":"QUETTA2 WH"},{"code":"530205","name":"QUETTA-3 WH"},{"code":"531001","name":"KHUZDAR1 WH"}]}};
const zoneSelect = document.getElementById("zone");
const regionSelect = document.getElementById("region");
const warehouseSelect = document.getElementById("location");

window.onload = function() {
    for (let zone in warehouseData) {
        let option = document.createElement("option");
        option.value = zone;
        option.textContent = zone;
        zoneSelect.appendChild(option);
    }
};

zoneSelect.addEventListener("change", function() {
    regionSelect.innerHTML = '<option value="">Select Region...</option>';
    warehouseSelect.innerHTML = '<option value="">Select Warehouse...</option>';
    let selectedZone = this.value;
    if (selectedZone) {
        for (let region in warehouseData[selectedZone]) {
            let option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        }
    }
});

regionSelect.addEventListener("change", function() {
    warehouseSelect.innerHTML = '<option value="">Select Warehouse...</option>';
    let selectedZone = zoneSelect.value;
    let selectedRegion = this.value;
    if (selectedZone && selectedRegion) {
        let warehouses = warehouseData[selectedZone][selectedRegion];
        warehouses.forEach(function(wh) {
            let option = document.createElement("option");
            option.value = wh.code + " - " + wh.name; 
            option.textContent = wh.code + " - " + wh.name;
            warehouseSelect.appendChild(option);
        });
    }
});

// --- 3. FORM SUBMISSION LOGIC ---
const salesForm = document.getElementById('sales-form');
const submitBtn = document.querySelector('.submit-btn');

salesForm.addEventListener('submit', function(e) {
    e.preventDefault();
    submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';
    submitBtn.disabled = true;

    const date = new Date();
    const dateString = date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
    const uniqueId = "FAT-" + dateString + "-" + (Math.floor(Math.random() * 900) + 100);

    const payload = {
        uid: uniqueId,
        productType: document.getElementById('product').value,
        dailyQty: document.getElementById('qty').value,
        location: document.getElementById('location').value,
        zone: document.getElementById('zone').value,
        region: document.getElementById('region').value,
        stage: "01. Pending RDM Approval" // Updates to new workflow stage
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(() => {
        showToast("Success! Shipment ID: " + uniqueId + " sent for RDM Approval.", "success");
        salesForm.reset(); 
        regionSelect.innerHTML = '<option value="">Select Region...</option>';
        warehouseSelect.innerHTML = '<option value="">Select Warehouse...</option>';
    })
    .catch((error) => { showToast("Error saving request. Check connection.", "error"); })
    .finally(() => { submitBtn.textContent = 'Submit Request'; submitBtn.disabled = false; });
});


// --- 3B. RDM APPROVAL LOGIC (NEW) ---
const approveBody = document.getElementById('approve-body');
const refreshApproveBtn = document.getElementById('refresh-approve');

function fetchRDMApprove() {
    approveBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading RDM approvals...</td></tr>';
    
    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if(data.status === "success") {
                approveBody.innerHTML = ''; 
                
                // RLS FILTERING FOR RDM
                const rdmShipments = data.data.filter(s => {
                    let stage = s.Stage || s.stage || "";
                    let region = s.Region || s.region || "";
                    
                    if (stage !== "01. Pending RDM Approval") return false;
                    if (currentUserRole === "Super Admin") return true;
                    
                    if (currentUserRole.includes("Regional Distribution Manager")) {
                        // Extracts "MULTAN" from "Regional Distribution Manager MULTAN"
                        let userRegion = currentUserRole.replace("Regional Distribution Manager ", "").trim().toUpperCase();
                        return region.toUpperCase() === userRegion;
                    }
                    return false;
                });
                
                if (rdmShipments.length === 0) {
                    approveBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending approvals for your region!</td></tr>';
                    return;
                }

                rdmShipments.forEach(shipment => {
                    let uid = shipment.UID || shipment.uid;
                    let product = shipment.Product_Type || shipment.productType;
                    let qty = shipment.Daily_Qty || shipment.dailyQty;
                    let loc = shipment.Warehouse_Location || shipment.location;
                    let shortLoc = loc.includes(" - ") ? loc.split(" - ")[0] : loc;

                    let row = `<tr>
                        <td><strong>${uid}</strong></td>
                        <td>${product}</td>
                        <td>${qty}</td>
                        <td>${shortLoc}</td>
                        <td>
                            <button onclick="approveRDM('${uid}')" style="background:#1a5c3a; color:white; border:none; padding:8px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">Approve</button>
                        </td>
                    </tr>`;
                    approveBody.innerHTML += row;
                });
            }
        })
        .catch(error => { approveBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading queue.</td></tr>'; });
}

window.approveRDM = function(uid) {
    const payload = { action: "update", uid: uid, stage: "02. Coordinator Queue" };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    .then(() => {
        showToast(`Shipment ${uid} approved successfully!`, "success");
        setTimeout(fetchRDMApprove, 1500); 
    })
    .catch((error) => { showToast("Error approving shipment.", "error"); });
};
if (refreshApproveBtn) refreshApproveBtn.addEventListener('click', fetchRDMApprove);
document.getElementById('btn-approve').addEventListener('click', fetchRDMApprove);


// --- 4. COORDINATOR QUEUE LOGIC (UPDATED WITH RLS) ---
const queueBody = document.getElementById('queue-body');
const refreshQueueBtn = document.getElementById('refresh-queue');

function fetchQueue() {
    queueBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading queue...</td></tr>';
    
    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if(data.status === "success") {
                queueBody.innerHTML = ''; 
                
                // RLS FILTERING FOR ZONAL COORDINATOR
                const pendingShipments = data.data.filter(s => {
                    let stage = s.Stage || s.stage || "";
                    let zone = s.Zone || s.zone || "";
                    
                    if (stage !== "02. Coordinator Queue") return false;
                    if (currentUserRole === "Super Admin") return true;
                    
                    if (currentUserRole.includes("Zonal Sales Coordinator")) {
                        // Extracts "Center" from "Zonal Sales Coordinator Center"
                        let userZone = currentUserRole.replace("Zonal Sales Coordinator ", "").trim().toUpperCase();
                        return zone.toUpperCase().includes(userZone);
                    }
                    return false;
                });
                
                if (pendingShipments.length === 0) {
                    queueBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending requests in your zone!</td></tr>';
                    return;
                }

                pendingShipments.forEach(shipment => {
                    let uid = shipment.UID || shipment.uid;
                    let product = shipment.Product_Type || shipment.productType;
                    let qty = shipment.Daily_Qty || shipment.dailyQty;

                    let row = `<tr>
                        <td><strong>${uid}</strong></td>
                        <td>${product}</td>
                        <td>${qty}</td>
                        <td>
                            <select id="plant-select-${uid}" style="padding: 6px; font-size: 0.9rem;">
                                <option value="">Select Plant...</option>
                                <option value="Sadiqabad Plant">Sadiqabad Plant</option>
                                <option value="Multan Plant">Multan Plant</option>
                                <option value="Sheikhupura Plant">Sheikhupura Plant</option>
                            </select>
                        </td>
                        <td>
                            <button onclick="assignPlant('${uid}')" style="background:#f9a826; border:none; padding:8px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">Assign</button>
                        </td>
                    </tr>`;
                    queueBody.innerHTML += row;
                });
            }
        })
        .catch(error => { queueBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading queue.</td></tr>'; });
}

window.assignPlant = function(uid) {
    const selectedPlant = document.getElementById(`plant-select-${uid}`).value;
    if (!selectedPlant) { alert("Please select a Plant before assigning!"); return; }

    const payload = { action: "update", uid: uid, stage: "03. Plant Fulfillment", assignedPlant: selectedPlant };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    .then(() => {
        showToast(`Successfully assigned ${uid} to ${selectedPlant}!`, "success");
        setTimeout(fetchQueue, 1500); 
    })
    .catch((error) => { showToast("Error updating shipment.", "error"); });
};
if (refreshQueueBtn) refreshQueueBtn.addEventListener('click', fetchQueue);
document.getElementById('btn-queue').addEventListener('click', fetchQueue);


// --- 5. PLANT FULFILLMENT LOGIC (UPDATED WITH RLS) ---
const plantBody = document.getElementById('plant-body');
const refreshPlantBtn = document.getElementById('refresh-plant');

function fetchPlantQueue() {
    plantBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading plant assignments...</td></tr>';
    
    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if(data.status === "success") {
                plantBody.innerHTML = ''; 
                
                // RLS FILTERING FOR PLANT MANAGERS
                const plantShipments = data.data.filter(s => {
                    let stage = s.Stage || s.stage || "";
                    let assignedPlant = s.Assigned_Plant || s.assignedPlant || s.AssignedPlant || "";
                    
                    if (stage !== "03. Plant Fulfillment") return false;
                    if (currentUserRole === "Super Admin") return true;
                    
                    if (currentUserRole.includes("Plant Logistics")) {
                        // Extracts "Multan" from "Plant Logistics Manager Multan"
                        let userPlantCity = currentUserRole.split(" ").pop().toUpperCase();
                        return assignedPlant.toUpperCase().includes(userPlantCity);
                    }
                    return false;
                });
                
                if (plantShipments.length === 0) {
                    plantBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending loads at your plant!</td></tr>';
                    return;
                }

                plantShipments.forEach(shipment => {
                    let uid = shipment.UID || shipment.uid;
                    let product = shipment.Product_Type || shipment.productType;
                    let qty = shipment.Daily_Qty || shipment.dailyQty;

                    let row = `<tr>
                        <td><strong>${uid}</strong></td>
                        <td>${product}</td>
                        <td>${qty}</td>
                        <td><input type="date" id="batch-date-${uid}" style="padding: 6px; font-size: 0.9rem; width: 100%;"></td>
                        <td><button onclick="dispatchPlant('${uid}')" style="background:#1a5c3a; color:white; border:none; padding:8px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">Dispatch</button></td>
                    </tr>`;
                    plantBody.innerHTML += row;
                });
            }
        })
        .catch(error => { plantBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading plant queue.</td></tr>'; });
}

window.dispatchPlant = function(uid) {
    const batchDate = document.getElementById(`batch-date-${uid}`).value;
    if (!batchDate) { alert("FIFO Rule: Please enter the Batch Production Date before dispatching!"); return; }

    const payload = { action: "update", uid: uid, stage: "04. Disbursement", assignedPlant: "Dispatched" };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    .then(() => {
        showToast(`Shipment ${uid} successfully dispatched!`, "success");
        setTimeout(fetchPlantQueue, 1500); 
    })
    .catch((error) => { showToast("Error updating shipment.", "error"); });
};
if (refreshPlantBtn) refreshPlantBtn.addEventListener('click', fetchPlantQueue);
document.getElementById('btn-plant').addEventListener('click', fetchPlantQueue);


// --- 6. ID TRACKER LOGIC ---
const trackerBody = document.getElementById('tracker-body');
const refreshTrackerBtn = document.getElementById('refresh-tracker');

function fetchShipments() {
    trackerBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading live data...</td></tr>';
    
    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if(data.status === "success") {
                trackerBody.innerHTML = ''; 
                const shipments = data.data.reverse(); 
                
                shipments.forEach(shipment => {
                    let uid = shipment.UID || shipment.uid || "N/A";
                    let product = shipment.Product_Type || shipment.productType || "N/A";
                    let qty = shipment.Daily_Qty || shipment.dailyQty || "0";
                    let location = shipment.Warehouse_Location || shipment.location || "N/A";
                    let stage = shipment.Stage || shipment.stage || "N/A";
                    let shortLocation = location.includes(" - ") ? location.split(" - ")[0] : location;

                    let row = `<tr>
                        <td><strong>${uid}</strong></td>
                        <td>${product}</td>
                        <td>${qty}</td>
                        <td>${shortLocation}</td>
                        <td><span class="stage-badge">${stage}</span></td>
                    </tr>`;
                    trackerBody.innerHTML += row;
                });
            }
        })
        .catch(error => { trackerBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading data.</td></tr>'; });
}
if(refreshTrackerBtn) refreshTrackerBtn.addEventListener('click', fetchShipments);
document.getElementById('btn-tracker').addEventListener('click', fetchShipments);


// --- 7. DISBURSEMENT DASHBOARD LOGIC ---
const dashboardBody = document.getElementById('dashboard-body');
const refreshDashboardBtn = document.getElementById('refresh-dashboard');

function fetchDashboard() {
    dashboardBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading records...</td></tr>';

    fetch(GOOGLE_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if(data.status === "success") {
                const allShipments = data.data;
                
                let prodTotals = {};
                let regTotals = {};
                
                allShipments.forEach(s => {
                    let prod = s.Product_Type || s.productType || "Unknown";
                    let location = s.Warehouse_Location || s.location || "Unknown";
                    let shortLoc = location.includes(" - ") ? location.split(" - ")[0] : location;
                    let qty = parseFloat(s.Daily_Qty || s.dailyQty) || 0;
                    
                    if(!prodTotals[prod]) prodTotals[prod] = 0;
                    prodTotals[prod] += qty;
                    
                    if(!regTotals[shortLoc]) regTotals[shortLoc] = 0;
                    regTotals[shortLoc] += qty;
                });

                if(prodChartInstance) prodChartInstance.destroy();
                prodChartInstance = new Chart(document.getElementById('productChart'), {
                    type: 'doughnut', data: { labels: Object.keys(prodTotals), datasets: [{ data: Object.values(prodTotals), backgroundColor: ['#1a5c3a', '#f9a826', '#28a745', '#17a2b8', '#6c757d', '#dc3545'] }] }, options: { maintainAspectRatio: false }
                });

                if(regChartInstance) regChartInstance.destroy();
                regChartInstance = new Chart(document.getElementById('regionChart'), {
                    type: 'bar', data: { labels: Object.keys(regTotals), datasets: [{ label: 'Total Tons', data: Object.values(regTotals), backgroundColor: '#1a5c3a' }] }, options: { maintainAspectRatio: false }
                });

                dashboardBody.innerHTML = ''; 
                const disbursedShipments = allShipments.filter(s => s.Stage === "04. Disbursement" || s.stage === "04. Disbursement");
                
                if (disbursedShipments.length === 0) {
                    dashboardBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No completed shipments yet!</td></tr>';
                    return;
                }

                disbursedShipments.reverse().forEach(shipment => {
                    let uid = shipment.UID || shipment.uid;
                    let product = shipment.Product_Type || shipment.productType;
                    let qty = shipment.Daily_Qty || shipment.dailyQty;
                    let loc = shipment.Warehouse_Location || shipment.location || "N/A";
                    let shortL = loc.includes(" - ") ? loc.split(" - ")[0] : loc;

                    let row = `<tr>
                        <td><strong>${uid}</strong></td>
                        <td>${product}</td>
                        <td>${qty}</td>
                        <td>${shortL}</td>
                        <td><span class="stage-badge" style="background:#28a745; color:white;">Completed</span></td>
                    </tr>`;
                    dashboardBody.innerHTML += row;
                });
            }
        })
        .catch(error => { dashboardBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading dashboard.</td></tr>'; });
}
if (refreshDashboardBtn) refreshDashboardBtn.addEventListener('click', fetchDashboard);
document.getElementById('btn-dashboard').addEventListener('click', fetchDashboard);


// --- 8. SEARCH & EXPORT ENHANCEMENTS ---
const searchInput = document.getElementById('search-tracker');
if (searchInput) {
    searchInput.addEventListener('keyup', function() {
        let filter = this.value.toLowerCase();
        let rows = document.querySelectorAll('#tracker-body tr');
        rows.forEach(row => {
            let rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(filter) ? '' : 'none'; 
        });
    });
}

const exportBtn = document.getElementById('export-csv');
if (exportBtn) {
    exportBtn.addEventListener('click', function() {
        let csv = [];
        let rows = document.querySelectorAll('#dashboard-table tr');
        for (let i = 0; i < rows.length; i++) {
            let row = [], cols = rows[i].querySelectorAll('td, th');
            for (let j = 0; j < cols.length; j++) {
                row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
            }
            csv.push(row.join(','));
        }
        let csvString = csv.join('\n');
        let downloadLink = document.createElement('a');
        downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
        downloadLink.target = '_blank';
        downloadLink.download = 'Fatima_Fertilizer_Disbursement_Report.csv';
        downloadLink.click();
    });
}

// --- 9. TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 300);
    }, 3500);
}