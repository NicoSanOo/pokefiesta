import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// CANVAS
const canvas = document.querySelector('canvas.webgl');

// ESCENA
const scene = new THREE.Scene();

// GLTF LOADER
const gltfLoader = new GLTFLoader();
let mixer; // Para animaciones
let currentModel; // Referencia al modelo actual
let currentModelPath = 'gengar.glb'; // Ruta inicial del modelo
let currentImagePath = 'gengar.png'; // Imagen inicial

// Variables para restaurar el color original de las luces
const originalLightColors = {
    ambient: 0x404040,
    hemisphere: 0x444444,
    point1: 0xffffff,
    point2: 0xffffff,
    directional: 0xffffff
};

// Intervalo para el cambio de luces (modo fiesta)
let lightInterval;

// Audio para el modo fiesta
const partyAudio = new Audio('rolita.mp3');
partyAudio.loop = true; // Para que la música se repita

// LUCES
const ambientLight = new THREE.AmbientLight(originalLightColors.ambient, 2);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(originalLightColors.hemisphere, 0x444444, 1.5);
hemisphereLight.position.set(0, 1, 0);
scene.add(hemisphereLight);

const pointLight1 = new THREE.PointLight(originalLightColors.point1, 1, 10);
pointLight1.position.set(3, 3, 3);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(originalLightColors.point2, 1, 10);
pointLight2.position.set(-3, 3, -3);
scene.add(pointLight2);

const directionalLight = new THREE.DirectionalLight(originalLightColors.directional, 1.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// CAMARA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(0, 2, 6);
scene.add(camera);

// CONTROLES DE ORBITA
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// RENDERER
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Función de animación
function animate() {
    requestAnimationFrame(animate);

    // Actualizar animaciones si las hay
    if (mixer) {
        mixer.update(0.01);
    }

    controls.update(); // Actualiza los controles
    renderer.render(scene, camera);
}
animate();

// Ajustar tamaño al redimensionar
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Función para cargar el modelo
function loadModel(path) {
    // Elimina el modelo actual si existe
    if (currentModel) {
        // Eliminar animaciones si existen
        if (mixer) {
            mixer.stopAllAction();
            mixer.uncacheRoot(currentModel);
            mixer = null;
        }
        
        // Limpiar geometrías y materiales
        currentModel.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        scene.remove(currentModel);
        currentModel = null;
    }

    // Cargar nuevo modelo
    gltfLoader.load(
        path,
        (gltf) => {
            currentModel = gltf.scene;

            // Configurar materiales para mejor renderizado
            currentModel.traverse((child) => {
                if (child.isMesh) {
                    // Asegurar que los materiales tengan configuración correcta
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => {
                            material.depthWrite = true;
                            material.depthTest = true;
                            material.transparent = false;
                            material.alphaTest = 0.5;
                        });
                    } else {
                        child.material.depthWrite = true;
                        child.material.depthTest = true;
                        child.material.transparent = false;
                        child.material.alphaTest = 0.5;
                    }
                    // Activar el renderizado de ambos lados
                    child.material.side = THREE.DoubleSide;
                }
            });

            scene.add(currentModel);

            // Ajustar posición y escala según el modelo
            if (path.includes('gengar')) {
                currentModel.position.set(0, 0, 0);
                currentModel.scale.set(0.7, 0.7, 0.7);
            } else if (path.includes('meloetta')) {
                currentModel.position.set(0, 0, 0);
                currentModel.scale.set(1.3, 1.3, 1.3);
            } else if (path.includes('lucario')) {
                currentModel.position.set(0, -0.5, 0);
                currentModel.scale.set(1, 1, 1);
            }

            // Si el modelo tiene animaciones
            if (gltf.animations.length) {
                mixer = new THREE.AnimationMixer(currentModel);
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    // Ajustar la velocidad de la animación según el modelo
                    if (path.includes('gengar')) {
                        action.timeScale = 0.7; // Reducir la velocidad a la mitad
                    } else if (path.includes('meloetta')) {
                        action.timeScale = 0.3; // Reducir más la velocidad para Meloetta
                    } else if (path.includes('lucario')) {
                        action.timeScale = 0.7; // Reducir más la velocidad para Lucario
                    }
                    action.play();
                });
            }
        },
        undefined,
        (error) => {
            console.error('Error cargando el modelo:', error);
        }
    );
}

// Cambiar colores de luces
function changeLightColors() {
    const randomColor = Math.random() * 0xffffff;
    ambientLight.color.setHex(randomColor);
    hemisphereLight.color.setHex(Math.random() * 0xffffff);
    pointLight1.color.setHex(Math.random() * 0xffffff);
    pointLight2.color.setHex(Math.random() * 0xffffff);
    directionalLight.color.setHex(Math.random() * 0xffffff);
    // Cambiar el color del fondo
    scene.background = new THREE.Color(randomColor);
}

// Restaurar las luces a su color original
function restoreOriginalLightColors() {
    ambientLight.color.setHex(originalLightColors.ambient);
    hemisphereLight.color.setHex(originalLightColors.hemisphere);
    pointLight1.color.setHex(originalLightColors.point1);
    pointLight2.color.setHex(originalLightColors.point2);
    directionalLight.color.setHex(originalLightColors.directional);
    // Restaurar el fondo negro
    scene.background = new THREE.Color(0x000000);
}

// Cambiar modelo y guardar en historial
function changeImageAndModel(newImagePath, newModelPath) {
    // Si el modelo es meloetta, la imagen debe ser meloetta.png
    if (newModelPath === 'meloetta.glb' || newModelPath === 'meloetta2.glb') {
        newImagePath = 'meloetta.png'; // Cambiar la imagen a meloetta.png
    }

    // Cambiar la imagen inferior
    const bottomImage = document.querySelector('.image-overlay.bottom img');
    bottomImage.src = newImagePath;

    // Cambiar el modelo 3D
    loadModel(newModelPath);

    // Actualizar el modelo y la imagen actuales
    currentImagePath = newImagePath;
    currentModelPath = newModelPath;
}

// Botón Fiesta
const partyButton = document.querySelector('.party-button');
partyButton.addEventListener('click', () => {
    // Si el intervalo ya está corriendo, lo detenemos y restauramos luces y modelo inicial
    if (lightInterval) {
        clearInterval(lightInterval);
        lightInterval = null; // Desactivar el modo fiesta
        restoreOriginalLightColors(); // Restaurar luces al estado original
        partyAudio.pause(); // Detener la música
        partyAudio.currentTime = 0; // Reiniciar la música al principio
        
        // Restaurar al modelo inicial y su imagen
        if (currentModelPath === 'gengar2.glb') {
            changeImageAndModel('gengar.png', 'gengar.glb');
        } else if (currentModelPath === 'meloetta2.glb') {
            changeImageAndModel('meloetta.png', 'meloetta.glb');
        } else if (currentModelPath === 'lucario2.glb') {
            changeImageAndModel('lucario.png', 'lucario.glb');
        }
        return; // Salir de la función para evitar cambios adicionales
    }

    // Activar el modo fiesta: cambiar las luces continuamente y reproducir música
    lightInterval = setInterval(changeLightColors, 500); // Cambiar colores cada 500ms
    partyAudio.play(); // Comenzar a reproducir la música

    // Cambiar al modelo de fiesta correspondiente
    if (currentModelPath === 'gengar.glb') {
        changeImageAndModel(currentImagePath, 'gengar2.glb');
    } 
    // Si el modelo actual es "meloetta.glb", cambia a "meloetta2.glb"
    else if (currentModelPath === 'meloetta.glb') {
        changeImageAndModel('meloetta2.png', 'meloetta2.glb');
    }
    // Si el modelo actual es "lucario.glb", cambia a "lucario2.glb"
    else if (currentModelPath === 'lucario.glb') {
        changeImageAndModel('lucario.png', 'lucario2.glb');
    }
});

// EVENTOS: Botones izquierdo y derecho
const rightButton = document.querySelector('.right-button');
rightButton.addEventListener('click', () => {
    // Si el modelo actual es "gengar.glb" o "gengar2.glb", cambiar a "meloetta.glb"
    if (currentModelPath === 'gengar.glb' || currentModelPath === 'gengar2.glb') {
        changeImageAndModel('meloetta.png', 'meloetta.glb');
    } 
    // Si el modelo actual es "meloetta.glb" o "meloetta2.glb", cambiar a "lucario.glb"
    else if (currentModelPath === 'meloetta.glb' || currentModelPath === 'meloetta2.glb') {
        changeImageAndModel('lucario.png', 'lucario.glb');
    }
    // Si el modelo actual es "lucario.glb" o "lucario2.glb", volver a "gengar.glb"
    else if (currentModelPath === 'lucario.glb' || currentModelPath === 'lucario2.glb') {
        // Si hay un intervalo activo (modo fiesta), lo detenemos
        if (lightInterval) {
            clearInterval(lightInterval);
            lightInterval = null;
            restoreOriginalLightColors();
        }
        changeImageAndModel('gengar.png', 'gengar.glb');
    }
});

const leftButton = document.querySelector('.left-button');
leftButton.addEventListener('click', () => {
    // Si el modelo actual es Gengar (normal o fiesta), ir a Lucario
    if (currentModelPath === 'gengar.glb' || currentModelPath === 'gengar2.glb') {
        changeImageAndModel('lucario.png', 'lucario.glb');
    }
    // Si el modelo actual es "meloetta.glb" o "meloetta2.glb", volver a "gengar.glb"
    else if (currentModelPath === 'meloetta.glb' || currentModelPath === 'meloetta2.glb') {
        changeImageAndModel('gengar.png', 'gengar.glb');
    }
    // Si el modelo actual es "lucario.glb" o "lucario2.glb", volver a "meloetta.glb"
    else if (currentModelPath === 'lucario.glb' || currentModelPath === 'lucario2.glb') {
        changeImageAndModel('meloetta.png', 'meloetta.glb');
    }
});

// Cargar el modelo inicial
loadModel('gengar.glb');
