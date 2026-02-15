/**
 * Format Date to Indonesian Locale
 * @param {string|Date} dateString 
 * @returns {string} Formatted date
 */
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

/**
 * Format Currency to IDR
 * @param {number} amount 
 * @returns {string} Formatted currency
 */
const formatCurrency = (amount) => {
    return 'Rp' + (amount || 0).toLocaleString('id-ID');
};

/**
 * Get Status Label with Emoji
 * @param {string} status 
 * @returns {string} Label
 */
const getStatusLabel = (status) => {
    switch (status) {
        case 'PENDING': return '⏳ Menunggu Konfirmasi';
        case 'WASHING': return '🫧 Sedang Dicuci';
        case 'IRONING': return '🔥 Sedang Disetrika';
        case 'READY': return '✅ Siap Diambil';
        case 'COMPLETED': return '🎉 Selesai / Sudah Diambil';
        default: return status;
    }
};

/**
 * Get Status Description
 * @param {string} status 
 * @returns {string} Description
 */
const getStatusDesc = (status) => {
    switch (status) {
        case 'PENDING': return 'Mohon tunggu, admin kami sedang memproses pesanan Anda.';
        case 'WASHING': return 'Pakaian Anda sedang kami cuci dengan deterjen premium agar bersih maksimal.';
        case 'IRONING': return 'Sedang dalam proses setrika uap agar rapi dan wangi.';
        case 'READY': return 'Silakan datang ke outlet untuk mengambil cucian Anda. Jangan lupa bawa nota ya!';
        case 'COMPLETED': return 'Terima kasih telah menggunakan jasa Sky Laundry!';
        default: return '';
    }
};

/**
 * Normalize Phone Number to 628xxx@c.us
 * @param {string} number 
 * @returns {string} Formatted WhatsApp ID
 */
const normalizePhoneNumber = (number) => {
    let formatted = number.toString().replace(/\D/g, ''); // Remove non-digits
    if (formatted.startsWith('08')) {
        formatted = '62' + formatted.slice(1);
    }
    if (!formatted.endsWith('@c.us')) {
        formatted += '@c.us';
    }
    return formatted;
};

module.exports = {
    formatDate,
    formatCurrency,
    getStatusLabel,
    getStatusDesc,
    normalizePhoneNumber
};
