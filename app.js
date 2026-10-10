const API = "/api";

function msg(text, isError = true) {
  const el = document.getElementById("dashboardMsg") || document.getElementById("msg");
  if (el) {
    el.style.color = isError ? "#f87171" : "#4ade80";
    el.textContent = text;
  }
}

function headers() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": "Bearer " + token } : {};
}

async function registerUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    msg("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch(API + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const text = await res.text();
    if (res.ok) {
      alert("Registration successful! Please log in.");
      location.href = "login.html";
    } else {
      msg(text || "Registration failed.");
    }
  } catch (err) {
    console.error(err);
    msg("Unable to connect to server.");
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    msg("Please enter your email and password.");
    return;
  }

  try {
    const res = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch (_) {}

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      location.href = "dashboard.html";
    } else {
      msg(data.message || text || "Invalid email or password.");
    }
  } catch (err) {
    console.error(err);
    msg("Unable to connect to server.");
  }
}

async function loadTransactions() {
  const token = localStorage.getItem("token");
  if (!token) {
    location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(API + "/transactions", { headers: headers() });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      location.href = "login.html";
      return;
    }

    if (!res.ok) {
      msg("Failed to load transactions.");
      return;
    }

    const transactions = await res.json();
    const rows = document.getElementById("rows");
    rows.innerHTML = "";

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === "INCOME") totalIncome += amt;
      else totalExpense += amt;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.date}</td>
        <td><span class="badge ${t.type.toLowerCase()}">${t.type}</span></td>
        <td>${t.category}</td>
        <td>₹${amt.toFixed(2)}</td>
        <td><button class="btn btn-delete" onclick="deleteTransaction(${t.id})">Delete</button></td>
      `;
      rows.appendChild(tr);
    });

    document.getElementById("income").textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById("expense").textContent = `₹${totalExpense.toFixed(2)}`;
    document.getElementById("balance").textContent = `₹${(totalIncome - totalExpense).toFixed(2)}`;
  } catch (err) {
    console.error(err);
    msg("Unable to connect to server.");
  }
}

async function addTransaction() {
  const typeEl = document.getElementById("type");
  const categoryEl = document.getElementById("category");
  const amountEl = document.getElementById("amount");
  const dateEl = document.getElementById("date");
  const descEl = document.getElementById("description");

  const amountVal = parseFloat(amountEl.value);
  const dateVal = dateEl.value;

  if (!amountVal || amountVal <= 0) {
    msg("Please enter a valid amount greater than 0.");
    return;
  }

  if (!dateVal) {
    msg("Please select a valid date.");
    return;
  }

  const payload = {
    type: typeEl.value,
    category: categoryEl.value,
    amount: amountVal,
    date: dateVal,
    description: descEl ? descEl.value.trim() : ""
  };

  try {
    msg("Adding transaction...", false);
    const res = await fetch(API + "/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers()
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      location.href = "login.html";
      return;
    }

    if (!res.ok) {
      const errText = await res.text();
      let errJson = {};
      try { errJson = JSON.parse(errText); } catch (_) {}
      msg(errJson.message || errText || "Failed to add transaction.");
      return;
    }

    msg("Transaction added successfully!", false);
    amountEl.value = "";
    if (descEl) descEl.value = "";
    await loadTransactions();
  } catch (err) {
    console.error(err);
    msg("Unable to connect to server.");
  }
}

async function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;

  try {
    const res = await fetch(API + "/transactions/" + id, {
      method: "DELETE",
      headers: headers()
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      location.href = "login.html";
      return;
    }

    msg("Transaction deleted.", false);
    await loadTransactions();
  } catch (err) {
    console.error(err);
    msg("Failed to delete transaction.");
  }
}

function logout() {
  localStorage.clear();
  location.href = "login.html";
}
