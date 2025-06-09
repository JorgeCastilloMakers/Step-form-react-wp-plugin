<?php

if (!class_exists('WP_React_Config')){
    /**
     * Clase para configurar la integración de React en WordPress
     */
    class WP_React_Config {
        /**
         * Variable para rastrear si el shortcode está presente en la página
         */
        private static $shortcode_present = false;

        /**
         * Constructor de la clase
         */
        public function __construct()
        {
            // Registrar una función para detectar si el shortcode está presente
            add_filter('the_content', [$this, 'detect_shortcode'], 1);
            add_filter('widget_text_content', [$this, 'detect_shortcode'], 1);
            
            // Cargar assets solo si el shortcode está presente
            add_action('wp_enqueue_scripts', [$this, 'load_assets'], 20);
            add_filter('script_loader_tag', [$this, 'add_type_attribute'], 10, 3);
            add_action('wp_head', [$this, 'add_manifest']);
        }

        /**
         * Detecta si el shortcode está presente en el contenido
         */
        public function detect_shortcode($content) {
            if (has_shortcode($content, 'bamuba_form')) {
                self::$shortcode_present = true;
            }
            return $content;
        }

        /**
         * Carga los assets de React solo si el shortcode está presente
         */
        public function load_assets()
        {
            // Solo cargar los assets si el shortcode está presente en la página
            // o si estamos en una página específica (por ejemplo, /contrato)
            if (self::$shortcode_present || is_page('contrato')) {
                wp_enqueue_style('react-style', plugin_dir_url(__FILE__) . '../public/assets/main.css');
                wp_enqueue_script('react-script', plugin_dir_url(__FILE__) . '../public/assets/main.js', [], '1.0.1', true);
            }
        }
        public function add_type_attribute($tag, $handle, $src)
        {
            if ('react-script' !== $handle) {
                return $tag;
            }

            $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
            return $tag;
        }

        public function add_manifest()
        {
            echo '<link rel="manifest" href="' . plugin_dir_url(__FILE__) . '../public/manifest.json" />';
        }
    }
}