<?php
/**
 * Clase para manejar la API REST del formulario
 *
 * @package Bamuba_Form_React
 */

// No necesitamos usar 'use' en WordPress ya que las clases están disponibles globalmente
class WP_React_Form_API {
    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_endpoints'));
    }

    /**
     * Registrar endpoints de la API
     */
    public function register_endpoints() {
        // Registrar en el log que se está intentando registrar el endpoint
        error_log('Registrando endpoint REST: bamuba-form/v1/submit');
        
        register_rest_route('bamuba-form/v1', '/submit', array(
            'methods' => WP_REST_Server::CREATABLE, // POST
            'callback' => array($this, 'handle_form_submission'),
            'permission_callback' => function() {
                return true; // Permitir acceso a todos los usuarios
            },
            'args' => array(
                'formData' => array(
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_array($param);
                    }
                )
            )
        ));
        
        // Registrar un endpoint de prueba simple para verificar que la API funciona
        register_rest_route('bamuba-form/v1', '/test', array(
            'methods' => WP_REST_Server::READABLE, // GET
            'callback' => function() {
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'El endpoint de prueba funciona correctamente'
                ), 200);
            },
            'permission_callback' => function() {
                return true;
            }
        ));
    }

    /**
     * Manejar el envío del formulario
     */
    public function handle_form_submission($request) {
        // Registrar la solicitud para depuración
        error_log('Solicitud recibida en el endpoint de formulario');
        
        // Obtener los parámetros JSON
        $params = $request->get_json_params();
        error_log('Parámetros recibidos: ' . print_r($params, true));
        
        // Verificar que existan los datos del formulario
        if (!isset($params['formData'])) {
            error_log('Error: Faltan datos del formulario');
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Faltan datos del formulario'
            ), 400);
        }
        
        $form_data = $params['formData'];
        error_log('Datos del formulario: ' . print_r($form_data, true));
        
        // Email de destino
        $to = 'j.a.castillo.jc@gmail.com'; // Email para pruebas
        
        // Asunto del correo
        $subject = 'Nueva solicitud de servicios - Bamuba Turismo';
        
        // Construir el cuerpo del mensaje en HTML
        $message = '<html><body>';
        $message .= '<h2>Nueva solicitud de servicios</h2>';
        $message .= '<table style="border-collapse: collapse; width: 100%;">';
        
        // Mapeo de campos para mostrar nombres más amigables
        $field_names = array(
            'nombreApellido' => 'Nombre y Apellido',
            'dni' => 'DNI',
            'email' => 'Correo Electrónico',
            'destino' => 'Destino',
            'grupoFamiliar' => 'Grupo Familiar',
            'servicios' => 'Servicios Solicitados',
            'aceptaTerminos' => 'Acepta Términos',
            'firma' => 'Firma',
            'aclaracion' => 'Aclaración',
            'fechaLugar' => 'Fecha y Lugar'
        );
        
        foreach ($form_data as $key => $value) {
            $display_name = isset($field_names[$key]) ? $field_names[$key] : ucfirst($key);
            
            if ($key === 'servicios' && is_array($value)) {
                $value = implode(', ', $value);
            } elseif ($key === 'aceptaTerminos') {
                $value = $value ? 'Sí' : 'No';
            } elseif ($key === 'firma' && !empty($value)) {
                // Si es una firma en base64, mostrar un texto en lugar de la imagen completa
                $value = '[Firma digital incluida]';
            }
            
            $message .= '<tr>';
            $message .= '<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">' . $display_name . '</td>';
            $message .= '<td style="padding: 8px; border: 1px solid #ddd;">' . $value . '</td>';
            $message .= '</tr>';
        }
        
        $message .= '</table>';
        $message .= '<p>Este mensaje fue enviado desde el formulario de solicitud de servicios de Bamuba Turismo.</p>';
        $message .= '</body></html>';
        
        // Configurar headers para HTML
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            'From: Bamuba Turismo <noreply@bamuba.tur.ar>'
        );
        
        // Enviar el correo
        $sent = wp_mail($to, $subject, $message, $headers);
        
        if ($sent) {
            error_log('Correo enviado correctamente');
            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Formulario enviado correctamente'
            ), 200);
        } else {
            error_log('Error al enviar el correo');
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'Error al enviar el formulario'
            ), 500);
        }
    }
}
