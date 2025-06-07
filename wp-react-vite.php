<?php

/**
 * Plugin Name: Bamuba Form React
 * Description: Create a react page in WordPress
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

require_once plugin_dir_path(__FILE__) . 'includes/class-wp-react-config.php';

add_action('plugins_loaded', function () {
    new WP_React_Config();
});
