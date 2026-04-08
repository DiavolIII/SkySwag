class ModelLoader {
    constructor() {
        this.models = {};
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.modelInfo = {
            '38fdfead6bf44d4492524375dbc64ddb': {
                name: 'Airbus H145',
                scale: 1.2,
                position: [0, 1, 0],
                color: '#d4af37'
            },
            'eurocopter_ecreuil_ec145': {
                name: 'Eurocopter EC145',
                scale: 1.3,
                position: [0, 0.8, 0],
                color: '#e31b23'
            },
            'helicopter': {
                name: 'Airbus H130',
                scale: 1.5,
                position: [0, 1, 0],
                color: '#d4af37'
            },
            'merlin_mk2_helicopter': {
                name: 'Merlin MK2',
                scale: 1.1,
                position: [0, 1.2, 0],
                color: '#333333'
            },
            'stealth_helicopter_-_wolf_.new_order': {
                name: 'Stealth Wolf',
                scale: 1.4,
                position: [0, 1, 0],
                color: '#000000'
            }
        };
    }

    async init(containerId) {
        // динамически импортируем Three.js
        const THREE = await this.loadThreeJS();
        
        const container = document.getElementById(containerId);
        if (!container) return;

        // создание сцены
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);

        // камера
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(5, 3, 8);
        this.camera.lookAt(0, 1, 0);

        // рендерер
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);

        // освещение
        const ambientLight = new THREE.AmbientLight(0x404060);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(2, 5, 3);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);

        const goldLight = new THREE.PointLight(0xd4af37, 0.8);
        goldLight.position.set(-3, 2, -2);
        this.scene.add(goldLight);

        const redLight = new THREE.PointLight(0xe31b23, 0.5);
        redLight.position.set(3, 1, 2);
        this.scene.add(redLight);

        // пол
        const gridHelper = new THREE.GridHelper(20, 20, 0xd4af37, 0x333333);
        gridHelper.position.y = -0.01;
        this.scene.add(gridHelper);

        const planeGeometry = new THREE.CircleGeometry(10, 32);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, 
            roughness: 0.4, 
            metalness: 0.6
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        plane.receiveShadow = true;
        this.scene.add(plane);

        // контролы
        const { OrbitControls } = await import('https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js');
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2.0;
        this.controls.enableZoom = true;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target.set(0, 1, 0);

        this.animate();
        window.addEventListener('resize', () => this.onResize(container));

        console.log('3D сцена инициализирована');
        return true;
    }

    async loadThreeJS() {
        return await import('https://unpkg.com/three@0.128.0/build/three.module.js');
    }

    async loadModel(modelPath, modelKey) {
        try {
            const THREE = await this.loadThreeJS();
            const { GLTFLoader } = await import('https://unpkg.com/three@0.128.0/examples/jsm/loaders/GLTFLoader.js');
            
            const loader = new GLTFLoader();
            const modelInfo = this.modelInfo[modelKey] || {
                name: modelKey,
                scale: 1.0,
                position: [0, 1, 0],
                color: '#d4af37'
            };
            
            return new Promise((resolve, reject) => {
                loader.load(
                    modelPath,
                    (gltf) => {
                        const model = gltf.scene;
                        
                        // масштабируем и позиционируем
                        model.scale.setScalar(modelInfo.scale);
                        model.position.set(modelInfo.position[0], modelInfo.position[1], modelInfo.position[2]);
                        model.rotation.y = Math.PI / 4;
                        
                        // настраиваем тени
                        model.traverse((node) => {
                            if (node.isMesh) {
                                node.castShadow = true;
                                node.receiveShadow = true;
                                
                                if (node.material) {
                                    if (Array.isArray(node.material)) {
                                        node.material.forEach(mat => {
                                            mat.roughness = 0.3;
                                            mat.metalness = 0.7;
                                            if (mat.map) mat.map.anisotropy = 16;
                                        });
                                    } else {
                                        node.material.roughness = 0.3;
                                        node.material.metalness = 0.7;
                                        if (node.material.map) node.material.map.anisotropy = 16;
                                    }
                                }
                            }
                        });
                        
                        console.log(`✅ Модель ${modelInfo.name} загружена:`, modelPath);
                        this.models[modelKey] = model;
                        resolve(model);
                    },
                    (xhr) => {
                        const percent = Math.floor((xhr.loaded / xhr.total) * 100);
                        console.log(`📦 Загрузка ${modelInfo.name}: ${percent}%`);
                    },
                    (error) => {
                        console.error(`❌ Ошибка загрузки ${modelInfo.name}:`, error);
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error('❌ Ошибка инициализации загрузчика:', error);
            throw error;
        }
    }

    async loadAllModels() {
        const modelPaths = [
            { path: '/assets/models/38fdfead6bf44d4492524375dbc64ddb.glb', key: '38fdfead6bf44d4492524375dbc64ddb' },
            { path: '/assets/models/eurocopter_ecreuil_ec145.glb', key: 'eurocopter_ecreuil_ec145' },
            { path: '/assets/models/helicopter.glb', key: 'helicopter' },
            { path: '/assets/models/merlin_mk2_helicopter.glb', key: 'merlin_mk2_helicopter' },
            { path: '/assets/models/stealth_helicopter_-_wolf_.new_order.glb', key: 'stealth_helicopter_-_wolf_.new_order' }
        ];

        const results = [];
        for (const model of modelPaths) {
            try {
                const loadedModel = await this.loadModel(model.path, model.key);
                results.push({ key: model.key, success: true, model: loadedModel });
            } catch (error) {
                console.warn(`⚠️ Не удалось загрузить ${model.key}, создаем заглушку`);
                const placeholder = this.createPlaceholderModel(model.key);
                results.push({ key: model.key, success: false, model: placeholder });
            }
        }
        return results;
    }

    createPlaceholderModel(key) {
        const THREE = this.THREE || new THREE();
        const group = new THREE.Group();
        
        const modelInfo = this.modelInfo[key] || {
            name: key,
            color: '#d4af37'
        };

        // основной корпус
        const bodyGeo = new THREE.CylinderGeometry(1, 1.2, 2.5, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: modelInfo.color || 0xd4af37, roughness: 0.3, metalness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.set(0, 1.2, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // кабина
        const cabinGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0xe31b23, roughness: 0.2, metalness: 0.3 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(1.2, 1.6, 0);
        cabin.scale.set(0.8, 0.6, 0.8);
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        group.add(cabin);

        // текст с названием
        const textSprite = this.createTextSprite(modelInfo.name);
        textSprite.position.set(0, 3.5, 1.5);
        group.add(textSprite);

        return group;
    }

    createTextSprite(message) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        context.fillStyle = 'rgba(0,0,0,0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'Bold 36px "Space Grotesk"';
        context.fillStyle = '#d4af37';
        context.textAlign = 'center';
        context.fillText(message, 256, 70);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(3, 0.8, 1);
        return sprite;
    }

    showModel(modelKey) {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        
        const model = this.models[modelKey];
        if (model) {
            this.scene.add(model);
            this.currentModel = model;
            const modelInfo = this.modelInfo[modelKey] || { name: modelKey };
            console.log(`🔄 Показана модель: ${modelInfo.name}`);
            
            if (this.controls) {
                this.controls.autoRotate = true;
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onResize(container) {
        if (!container) return;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

window.modelLoader = new ModelLoader();
