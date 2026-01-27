// بيانات التطبيق
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
    }
});
// بيانات التطبيق
const clinicData = {
    users: JSON.parse(localStorage.getItem('users')) || [
        {
            id: 1,
            name: "المسؤول",
            username: "admin",
            password: "admin123",
            role: "admin"
        }
    ],
    patients: JSON.parse(localStorage.getItem('patients')) || [],
    services: JSON.parse(localStorage.getItem('services')) || [
        { id: 1, name: "كشف أولي", price: 200 },
        { id: 2, name: "حشو عادي", price: 300 },
        { id: 3, name: "حشو عصبي", price: 800 },
        { id: 4, name: "تنظيف جير", price: 400 }
    ],
    appointments: JSON.parse(localStorage.getItem('appointments')) || [],
    payments: JSON.parse(localStorage.getItem('payments')) || []
};

// حفظ البيانات في localStorage
function saveData() {
    localStorage.setItem('users', JSON.stringify(clinicData.users));
    localStorage.setItem('patients', JSON.stringify(clinicData.patients));
    localStorage.setItem('services', JSON.stringify(clinicData.services));
    localStorage.setItem('appointments', JSON.stringify(clinicData.appointments));
    localStorage.setItem('payments', JSON.stringify(clinicData.payments));
}
function updateRevenue() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let daily = 0, weekly = 0, monthly = 0;

    clinicData.payments.forEach(payment => {
        const paymentDate = new Date(payment.date);
        const paymentStr = paymentDate.toISOString().split('T')[0];

        // الإيراد اليومي
        if (paymentStr === todayStr) {
            daily += Number(payment.amount);
        }

        // الإيراد الأسبوعي (آخر 7 أيام)
        const diffDays = (today - paymentDate) / (1000 * 60 * 60 * 24);
        if (diffDays <= 7) {
            weekly += Number(payment.amount);
        }

        // الإيراد الشهري (نفس الشهر والسنة)
        if (
            paymentDate.getMonth() === today.getMonth() &&
            paymentDate.getFullYear() === today.getFullYear()
        ) {
            monthly += Number(payment.amount);
        }
    });

    document.getElementById('dailyRevenue').textContent = daily.toFixed(2) + ' ج.م';
    document.getElementById('weeklyRevenue').textContent = weekly.toFixed(2) + ' ج.م';
    document.getElementById('monthlyRevenue').textContent = monthly.toFixed(2) + ' ج.م';
}


// وظائف مساعدة
function getPaymentMethodName(method) {
    const methods = {
        'cash': 'نقدي',
        'card': 'بطاقة ائتمان',
        'transfer': 'تحويل بنكي',
        'mobile': 'محفظة إلكترونية'
    };
    return methods[method] || method;
}

function getStatusName(status) {
    const statuses = {
        'pending': 'قيد الانتظار',
        'completed': 'مكتمل',
        'canceled': 'ملغى'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// حماية الصفحات
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
    }
    return currentUser;
}
function initializeRevenue() {
    let today = new Date().toLocaleDateString('en-CA');
    let currentWeek = getWeekNumber(new Date());
    let currentMonth = new Date().getMonth() + 1;

    let revenueData = JSON.parse(localStorage.getItem('revenueData')) || {
        daily: 0,
        weekly: 0,
        monthly: 0,
        lastDay: today,
        lastWeek: currentWeek,
        lastMonth: currentMonth
    };

    if (revenueData.lastDay !== today) {
        revenueData.daily = 0;
        revenueData.lastDay = today;
    }
    if (revenueData.lastWeek !== currentWeek) {
        revenueData.weekly = 0;
        revenueData.lastWeek = currentWeek;
    }
    if (revenueData.lastMonth !== currentMonth) {
        revenueData.monthly = 0;
        revenueData.lastMonth = currentMonth;
    }

    localStorage.setItem('revenueData', JSON.stringify(revenueData));
    updateRevenueDisplay();
}

function addPaymentToRevenue(amount) {
    let revenueData = JSON.parse(localStorage.getItem('revenueData')) || {};
    revenueData.daily = (revenueData.daily || 0) + amount;
    revenueData.weekly = (revenueData.weekly || 0) + amount;
    revenueData.monthly = (revenueData.monthly || 0) + amount;
    localStorage.setItem('revenueData', JSON.stringify(revenueData));
    updateRevenueDisplay();
}

function updateRevenueDisplay() {
    let revenueData = JSON.parse(localStorage.getItem('revenueData')) || {};
    document.getElementById('dailyRevenue').textContent = (revenueData.daily || 0).toFixed(2) + ' ج';
    document.getElementById('weeklyRevenue').textContent = (revenueData.weekly || 0).toFixed(2) + ' ج';
    document.getElementById('monthlyRevenue').textContent = (revenueData.monthly || 0).toFixed(2) + ' ج';
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

initializeRevenue();
// ========== تحديث الصفحة الرئيسية ==========
if (document.getElementById('todayPatients')) {
    function updateDashboard() {
        // تحديث عدد المرضى
        const patientsCount = clinicData.patients.length;
        document.getElementById('todayPatients').textContent = patientsCount;
        
        // تحديث الإيرادات
        const totalIncome = clinicData.payments.reduce((sum, payment) => sum + payment.amount, 0);
        document.getElementById('todayIncome').textContent = `${totalIncome} ج`;
        
        // تحديث المواعيد (آخر 3 مواعيد)
        const appointmentsList = document.getElementById('appointmentsList');
        appointmentsList.innerHTML = '';
        
        const recentAppointments = clinicData.appointments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
            
        recentAppointments.forEach(app => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${app.patient}</span>
                <small>${new Date(app.date).toLocaleDateString()} - ${app.time}</small>
            `;
            appointmentsList.appendChild(li);
        });
    }
    
    // تحديث البيانات عند تحميل الصفحة
    updateDashboard();
    
    // تحديث البيانات كل 5 ثواني (اختياري)
    setInterval(updateDashboard, 5000);
}