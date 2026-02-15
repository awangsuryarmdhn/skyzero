const { query } = require('../config/database');

const getSettings = async () => {
    try {
        const rows = await query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => {
            // Convert 'true'/'false' strings to booleans
            if (row.setting_value === 'true') settings[row.setting_key] = true;
            else if (row.setting_value === 'false') settings[row.setting_key] = false;
            else settings[row.setting_key] = row.setting_value;
        });
        return settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { ownerNumber: '', autoReply: true }; // Default fallback
    }
};

const updateSetting = async (key, value) => {
    try {
        await query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, String(value), String(value)]
        );
        return true;
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        return false;
    }
};

module.exports = { getSettings, updateSetting };
