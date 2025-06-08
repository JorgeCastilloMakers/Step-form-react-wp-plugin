<?php

/**
 * Plugin Name: Bamuba Form React
 * Description: Create a react page in WordPress with form submission capabilities
 * Version: 1.0.0
 * Author: Jorge Castillo
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Cargar las clases necesarias
require_once plugin_dir_path(__FILE__) . 'includes/class-wp-react-config.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-wp-react-api.php';

// Inicializar las clases principales
add_action('init', function () {
    // Registrar el shortcode para el formulario
    add_shortcode('bamuba_form', function() {
        return '<div id="root"></div>';
    });
});

// Inicializar la configuración de React y la API REST
add_action('plugins_loaded', function () {
    new WP_React_Config();
    new WP_React_Form_API();
    
    // Registrar en el log que el plugin se ha cargado
    error_log('Plugin Bamuba Form React cargado correctamente');
});

/**
 * Pasar datos necesarios a JavaScript
 */
function bamuba_form_localize_script() {
    // Asegurarse de que el script esté registrado antes de localizarlo
    if (!wp_script_is('react-script', 'registered')) {
        wp_register_script('react-script', plugin_dir_url(__FILE__) . 'public/assets/main.js', array(), '1.0.0', true);
    }
    
    // Localizar el script con los datos necesarios
    wp_localize_script('react-script', 'bamubaFormData', array(
        'apiUrl' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}

// Asegurarse de que se ejecute después de que se hayan registrado los scripts
add_action('wp_enqueue_scripts', 'bamuba_form_localize_script', 20);
