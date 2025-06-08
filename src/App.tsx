import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import SignatureCanvas from 'react-signature-canvas';

// Componente Loader
const Loader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#604A40] mb-4"></div>
      <p className="text-lg font-medium">Enviando formulario...</p>
    </div>
  </div>
);

// Asegurarse de que React esté en el ámbito global
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Declaración para TypeScript para acceder a bamubaFormData global
declare global {
  interface Window {
    bamubaFormData?: {
      apiUrl: string;
      nonce: string;
    };
  }
}


type FormData = {
  nombreApellido: string;
  dni: string;
  email: string;
  destino: string;
  grupoFamiliar: string;
  servicios: string[];
  aceptaTerminos: boolean;
  firma: string;
  aclaracion: string;
  fechaLugar: string;
};



const serviciosOptions = [
  'Aéreos',
  'Terrestres',
  'Hotelería',
  'Circuitos',
  'Cruceros',
  'Seguros asistencia al viajero',
  'Alquiler de vehículos'
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  

  
  const [formData, setFormData] = useState<FormData>({
    nombreApellido: '',
    dni: '',
    email: '',
    destino: '',
    grupoFamiliar: '',
    servicios: [],
    aceptaTerminos: false,
    firma: '',
    aclaracion: '',
    fechaLugar: `${new Date().toLocaleDateString('es-AR')}, Buenos Aires`
  });
  const signatureRef = useRef<any>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);

  const handleEnd = useCallback(() => {
    if (signatureRef.current) {
      const isEmpty = signatureRef.current.isEmpty();
      setIsSignatureEmpty(isEmpty);
      if (!isEmpty) {
        const signatureData = signatureRef.current.toDataURL();
        setFormData(prev => ({
          ...prev,
          firma: signatureData
        }));
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsSignatureEmpty(true);
      setFormData(prev => ({
        ...prev,
        firma: ''
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      servicios: checked
        ? [...prev.servicios, value]
        : prev.servicios.filter(servicio => servicio !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let apiUrl = '/wp-json';
      let nonce = '';
      
      if (typeof window.bamubaFormData !== 'undefined') {
        apiUrl = window.bamubaFormData.apiUrl;
        nonce = window.bamubaFormData.nonce;
      }
      
      const formDataToSend = {
        ...formData,
        firma: signatureRef.current?.toDataURL() || ''
      };
      
      try {
        const testResponse = await fetch(`${apiUrl}bamuba-form/v1/test`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        await testResponse.json();
      } catch (testError) {
        console.error('Error al probar el endpoint:', testError);
      }
      
      const response = await fetch(`${apiUrl}bamuba-form/v1/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
          formData: formDataToSend
        })
      });
            
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Respuesta de error completa:', errorText);
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setCurrentStep(9);
      } else {
        throw new Error(result.message || 'Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert(`Ocurrió un error al enviar el formulario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);



  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Renderizado condicional basado en el paso actual
  const renderStep = (): React.ReactElement => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            key="step-0"
            variants={itemVariants}
            className="text-center"
          >
            <img 
              src="https://bamuba.tur.ar/wp-content/uploads/2025/06/bamuba-logo-recto-new.png" 
              alt="Bamuba Turismo" 
              className="w-[30%] mx-auto mb-8 h-16"
            />
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Requerimiento para la prestación de servicios de intermediación</h1>
            <p className="text-gray-700 mb-8">
              El siguiente formulario es para completar el requerimiento para la prestación de servicios de intermediación y condiciones
              generales complementarias del contrato de servicios turísticos según la Federación
              Argentina de Asociaciones de Empresas de Viajes y Turismo - FAEVYT.
            </p>
            <button
              onClick={nextStep}
              className="bg-[#604A40] border-none text-white px-8 py-3 rounded-lg text-lg hover:bg-[#604A40]/80 transition-colors"
            >
              Comenzar
            </button>
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            key="step-1"
            variants={itemVariants}
            className="w-full mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">Por medio de la presente quien suscribe, la Sra./ el Sr.</h2>
            <div className="mb-6">
              <input
                type="text"
                name="nombreApellido"
                value={formData.nombreApellido}
                onChange={handleInputChange}
                className="w-full rounded-lg p-4 text-xl border-none border-b-1 border-[#e9e9e9] focus:ring-0 focus:border-[#604A40]"
                placeholder="Ingrese su nombre y apellido"
                required
              />
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="bg-[#604A40] border-none text-white px-8 py-3 rounded-lg text-lg hover:bg-[#604A40]/80 transition-colors"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.nombreApellido.trim()}
                className={`bg-[#604A40] border-none text-white px-8 py-3 rounded-lg text-lg hover:bg-[#604A40]/80 transition-colors ${formData.nombreApellido.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="step-2"
            variants={itemVariants}
            className="w-full md:min-w-[500px] mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">Ingrese su número de DNI:</h2>
            <div className="mb-6">
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                className="w-full rounded-lg p-4 text-xl border-b-2 border-gray-300 focus:border-[#604A40] focus:ring-0 focus:outline-none"
                placeholder="Ingrese su número de DNI"
                required
              />
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-600 hover:text-blue-800"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.dni.trim()}
                className={`px-6 py-2 rounded-lg ${formData.dni.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="step-3"
            variants={itemVariants}
            className="w-full md:min-w-[500px] mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">Con su correo electrónico:</h2>
            <div className="mb-6">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-4 text-xl border-b-2 border-gray-300 focus:ring-0 focus:outline-none"
                placeholder="Ingrese su correo electrónico"
                required
              />
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-600 hover:text-blue-800"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)}
                className={`px-6 py-2 rounded-lg ${formData.email.trim() && /^\S+@\S+\.\S+$/.test(formData.email) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            key="step-4"
            variants={itemVariants}
            className="w-full mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">A todos los fines que surjan del contrato de intermediación en:</h2>
            <div className="mb-6">
              <input
                type="text"
                name="destino"
                value={formData.destino}
                onChange={handleInputChange}
                className="w-full p-4 text-xl border-b-2 border-gray-300 focus:border-[#604A40] focus:ring-0 focus:outline-none"
                placeholder="Ingrese el destino del viaje"
                required
              />
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-600 hover:text-blue-800"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.destino.trim()}
                className={`px-6 py-2 rounded-lg ${formData.destino.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            key="step-5"
            variants={itemVariants}
            className="w-full mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">
              Vengo a solicitar a la Agencia de Viajes BAMUBA EMPRESA DE VIAJES Y
              TURISMO – Legajo 19.771 preste sus servicios de intermediación a favor de mi persona y mi grupo familiar / de viaje:
            </h2>
            <div className="mb-6">
              <input
                type="text"
                name="grupoFamiliar"
                value={formData.grupoFamiliar}
                onChange={handleInputChange}
                className="w-full p-4 text-xl border-b-2 border-gray-300 focus:border-[#604A40] focus:ring-0 focus:outline-none"
                placeholder="Ingrese los nombres del grupo familiar o de viaje"
                required
              />
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-600 hover:text-blue-800"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.grupoFamiliar.trim()}
                className={`px-6 py-2 rounded-lg ${formData.grupoFamiliar.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div 
            key="step-6"
            variants={itemVariants}
            className="w-full mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">A fin de poder adquirir los siguientes servicios turísticos (marque los que correspondan):</h2>
            <div className="space-y-4 mb-8">
              {serviciosOptions.map((servicio) => (
                <label key={servicio} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    value={servicio}
                    checked={formData.servicios.includes(servicio)}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-[#604A40] rounded border-gray-300 focus:ring-[#604A40]"
                  />
                  <span className="text-lg">{servicio}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-600 hover:text-blue-800"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={formData.servicios.length === 0}
                className={`px-6 py-2 rounded-lg ${formData.servicios.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div 
            key="step-7"
            variants={itemVariants}
            className="w-full mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">Términos y condiciones</h2>
            <div className="prose prose-lg mb-8">
              <p className="mb-4">
                Asimismo, presto mi expresa conformidad a que por dicha actividad se me cobre la retribución que la agencia
                disponga, independientemente de la concreción o no de la contratación final de los servicios a los prestadores
                directos o de hecho de los servicios.
              </p>
              <p className="mb-6">
                Tomo conocimiento y me notifico que las solicitudes de servicios se regirán
                por las condiciones particulares de cada prestador y/o por las generales que a continuación se detallan, a menos
                que se disponga lo contrario.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="aceptaTerminos"
                    checked={formData.aceptaTerminos}
                    onChange={(e) => setFormData({...formData, aceptaTerminos: e.target.checked})}
                    className="h-5 w-5 mt-1 text-[#604A40] rounded border-gray-300 focus:ring-[#604A40]"
                    required
                  />
                  <span className="text-gray-700">
                    He leído y acepto las{' '}
                    <a 
                      href="https://bamuba.tur.ar/condiciones-generales-de-contratacion/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#604A40] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      condiciones generales de contratación
                    </a>
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-600 hover:text-blue-800"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!formData.aceptaTerminos}
                className={`px-6 py-2 rounded-lg ${formData.aceptaTerminos ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        );
      case 8:
        return (
          <motion.div 
            key="step-8"
            variants={itemVariants}
            className="w-full mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">Firma digital</h2>
            <div className="space-y-6">
              <div className="signature-container" style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', width: '100%' }}>
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="#000000"
                  canvasProps={{
                    className: 'signature-canvas',
                    style: {
                      width: '100%',
                      height: '200px',
                      borderRadius: '0.5rem'
                    }
                  }}
                  onEnd={handleEnd}
                  clearOnResize={false}
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#4a5568'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  className="clear-signature"
                >
                  Limpiar firma
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aclaración</label>
                <input
                  type="text"
                  name="aclaracion"
                  value={formData.aclaracion}
                  onChange={handleInputChange}
                  className="w-full p-3 text-lg border-b-2 border-gray-300 focus:border-[#604A40] focus:ring-0 focus:outline-none"
                  placeholder="Aclaración de la firma"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y lugar</label>
                <input
                  type="text"
                  name="fechaLugar"
                  value={formData.fechaLugar}
                  onChange={handleInputChange}
                  className="w-full p-3 text-lg border-b-2 border-gray-300 focus:border-[#604A40] focus:ring-0 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between mt-12">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-600 hover:text-blue-800"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={isSignatureEmpty || !formData.aclaracion.trim()}
                className={`px-6 py-2 rounded-lg ${
                  !isSignatureEmpty && formData.aclaracion.trim() 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Enviar solicitud
              </button>
            </div>
            <div className="w-full flex justify-between items-center gap-[20px] mt-[20px]">
              <div className="flex justify-end items-center w-[40%]">
              <img 
                src="https://bamuba.tur.ar/wp-content/uploads/2025/06/bamuba-logo-recto-new.png" 
                alt="Bamuba Turismo" 
                className="w-[50%] m-0 h-16"
              />
              <img 
                src="https://bamuba.tur.ar/wp-content/uploads/2025/05/qr.png" 
                alt="QR" 
                className="w-[25%] m-0 h-16"
              />                
              </div>

            <div className="flex flex-col justify-center items-start w-[60%]">
              <p>©Todos los derechos reservados</p>
              <p>Bamuba Empresa de Viajes y Turismo – Legajo 19.771</p>
            </div>
            </div>
          </motion.div>
        );
      case 9:
        return (
          <motion.div 
            key="step-9"
            variants={itemVariants}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">¡Solicitud enviada con éxito!</h2>
            <p className="text-gray-600 mb-8">Hemos recibido su solicitud de servicios. Nos pondremos en contacto con usted a la brevedad.</p>
            <button
              onClick={() => {
                setCurrentStep(0);
                // Resetear el formulario
                setFormData({
                  nombreApellido: '',
                  dni: '',
                  email: '',
                  destino: '',
                  grupoFamiliar: '',
                  servicios: [],
                  aceptaTerminos: false,
                  firma: '',
                  aclaracion: '',
                  fechaLugar: `${new Date().toLocaleDateString('es-AR')}, Buenos Aires`
                });
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
          </motion.div>
        );
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  return (
    <div className="w-full flex items-center min-w-[100vw] justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStep}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="form-container rounded-2xl shadow-lg w-full max-w-4xl min-h-[536px] p-8 bg-white"
        >
          <form onSubmit={handleSubmit} id="form-contract" className="h-full">
            {renderStep()}
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
