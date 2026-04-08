import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export function initThreeScene() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(5, 3, 8);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // освещение
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(2, 5, 3);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.PointLight(0xd4af37, 0.5);
    backLight.position.set(-3, 2, -2);
    scene.add(backLight);

    const fillLight = new THREE.PointLight(0xe31b23, 0.3);
    fillLight.position.set(1, 1, 4);
    scene.add(fillLight);

    // пол с отражением
    const gridHelper = new THREE.GridHelper(20, 20, 0xd4af37, 0x333333);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const planeGeometry = new THREE.CircleGeometry(8, 32);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.6, emissive: 0x000000 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);

    // контроль
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.enableZoom = true;
    controls.target.set(0, 1, 0);

    // загрузка FBX модели (заглушка, если файла нет — создаем примитив)
    const loader = new FBXLoader();
    
    // пытаемся загрузить реальную модель, если есть
    loader.load(
        '/assets/models/helicopter.fbx',
        (object) => {
            object.scale.setScalar(0.02);
            object.position.set(0, 1.2, 0);
            object.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // добавляем золотисто-красный оттенок материалам
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.emissive = new THREE.Color(0x331100);
                                mat.roughness = 0.4;
                                mat.metalness = 0.6;
                            });
                        } else {
                            child.material.emissive = new THREE.Color(0x331100);
                            child.material.roughness = 0.4;
                            child.material.metalness = 0.6;
                        }
                    }
                }
            });
            scene.add(object);
        },
        undefined,
        (error) => {
            console.warn('FBX loading failed, using fallback model:', error);
            createFallbackModel(scene);
        }
    );

    function createFallbackModel(scene) {
        // создаем стилизованный вертолет из примитивов
        const group = new THREE.Group();

        // основной корпус
        const bodyGeo = new THREE.CylinderGeometry(1, 1.2, 2.5, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x331100, roughness: 0.3, metalness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.set(0, 1, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // кабина
        const cabinGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111122, emissive: 0x110000, roughness: 0.2, metalness: 0.3 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(1.2, 1.4, 0);
        cabin.scale.set(0.8, 0.6, 0.8);
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        group.add(cabin);

        // хвост
        const tailGeo = new THREE.BoxGeometry(0.4, 0.4, 2.5);
        const tailMat = new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0x331100 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(-1.8, 1.2, 0);
        tail.castShadow = true;
        tail.receiveShadow = true;
        group.add(tail);

        // винт (мейн)
        const rotorGroup = new THREE.Group();
        const bladeGeo = new THREE.BoxGeometry(2.8, 0.1, 0.3);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0x331100 });
        
        for (let i = 0; i < 2; i++) {
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.rotation.y = (i * Math.PI / 2);
            blade.position.y = 0;
            blade.castShadow = true;
            blade.receiveShadow = true;
            rotorGroup.add(blade);
        }
        
        const rotorCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0xe31b23 }));
        rotorCenter.castShadow = true;
        rotorGroup.add(rotorCenter);
        
        rotorGroup.position.set(0, 2.5, 0);
        group.add(rotorGroup);

        // хвостовой винт
        const tailRotorGeo = new THREE.BoxGeometry(0.2, 0.8, 0.8);
        const tailRotorMat = new THREE.MeshStandardMaterial({ color: 0xd4af37 });
        const tailRotor = new THREE.Mesh(tailRotorGeo, tailRotorMat);
        tailRotor.position.set(-2.8, 1.4, 0);
        tailRotor.castShadow = true;
        tailRotor.receiveShadow = true;
        group.add(tailRotor);

        // полозья
        const skidGeo = new THREE.BoxGeometry(2.2, 0.1, 0.3);
        const skidMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const skidLeft = new THREE.Mesh(skidGeo, skidMat);
        skidLeft.position.set(0, 0.2, 1);
        skidLeft.castShadow = true;
        skidLeft.receiveShadow = true;
        group.add(skidLeft);
        
        const skidRight = new THREE.Mesh(skidGeo, skidMat);
        skidRight.position.set(0, 0.2, -1);
        skidRight.castShadow = true;
        skidRight.receiveShadow = true;
        group.add(skidRight);

        scene.add(group);
    }

    // анимация
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // ресайз
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}