<?php

if (!class_exists('WP_React_Config')){
    /**
     * Clase para configurar la integración de React en WordPress
     */
    class WP_React_Config {
        /**
         * Constructor de la clase
         */
        public function __construct()
        {
            add_action('wp_enqueue_scripts', [$this, 'load_assets']);
            add_filter('script_loader_tag', [$this, 'add_type_attribute'], 10, 3);
            add_action('wp_head', [$this, 'add_manifest']);
        }

        /**
         * Carga los assets de React
         */
        public function load_assets()
        {
            wp_enqueue_style('react-style', plugin_dir_url(__FILE__) . '../public/assets/main.css');
            wp_enqueue_script('react-script', plugin_dir_url(__FILE__) . '../public/assets/main.js', [], '1.0.1', true);
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