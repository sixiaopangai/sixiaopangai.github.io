// particle-bg.js - 动态粒子背景脚本
// PC端运行粒子效果，移动端显示静态图片

// 等待页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
  // 检测是否为移动设备（更通用的检测方式）
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                   || window.innerWidth < 768;
  
  // 如果是移动设备，不加载粒子效果，使用静态图片
  if (isMobile) {
      console.log('Mobile device detected, using static banner image');
      return; // 移动端直接返回，使用配置中的 banner_img
  }

  console.log('PC detected, initializing Three.js particle background...');

  // 找到 Fluid 主题的 banner 区域
  const banner = document.getElementById('banner');
  if (!banner) {
      console.warn('Banner element not found, skipping particle background');
      return;
  }

  // 创建一个容器来放置 Canvas
  const container = document.createElement('div');
  container.id = 'three-bg-container';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '0'; // 在 banner 内容后面
  container.style.pointerEvents = 'none'; // 让鼠标事件穿透，不影响页面交互
  
  // 将容器插入到 banner 的最前面
  banner.style.position = 'relative';
  banner.insertBefore(container, banner.firstChild);

  // 隐藏原有的背景图片（PC端）
  const bannerBg = banner.querySelector('.banner-bg');
  if (bannerBg) {
      bannerBg.style.opacity = '0';
  }

  let scene, camera, renderer, particles;
  let count = 0;
  let mouseX = 0, mouseY = 0;
  let animationId = null;

  init();
  animate();

  function init() {
      // 检查 THREE 是否已加载
      if (typeof THREE === 'undefined') {
          console.error('Three.js is not loaded!');
          // 如果 Three.js 加载失败，恢复显示原背景图
          if (bannerBg) {
              bannerBg.style.opacity = '1';
          }
          return;
      }

      scene = new THREE.Scene();
      // 设置深色背景
      scene.background = new THREE.Color(0x0d1117);

      const width = container.offsetWidth || window.innerWidth;
      const height = container.offsetHeight || window.innerHeight;

      camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
      camera.position.z = 1000;

      // 粒子数量，根据性能调整
      const particleCount = 3000; 
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const colorObj = new THREE.Color();

      for (let i = 0; i < particleCount; i++) {
          positions.push((Math.random() * 2 - 1) * 2000);
          positions.push((Math.random() * 2 - 1) * 2000);
          positions.push((Math.random() * 2 - 1) * 2000);

          // 设置粒子颜色，蓝紫色系
          colorObj.setHSL(Math.random() * 0.3 + 0.5, 0.9, Math.random() * 0.2 + 0.6);
          colors.push(colorObj.r, colorObj.g, colorObj.b);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
          size: 6,
          vertexColors: true,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false
      });

      particles = new THREE.Points(geometry, material);
      scene.add(particles);

      renderer = new THREE.WebGLRenderer({ 
          antialias: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      window.addEventListener('resize', onWindowResize);
      document.addEventListener('mousemove', onDocumentMouseMove);

      console.log('Three.js particle background initialized successfully!');
  }

  function onWindowResize() {
      // 再次检测是否变成移动端尺寸
      if (window.innerWidth < 768) {
          // 如果窗口变小到移动端尺寸，停止动画并显示静态图
          if (animationId) {
              cancelAnimationFrame(animationId);
              animationId = null;
          }
          container.style.display = 'none';
          if (bannerBg) {
              bannerBg.style.opacity = '1';
          }
          return;
      } else {
          container.style.display = 'block';
          if (bannerBg) {
              bannerBg.style.opacity = '0';
          }
      }

      const width = container.offsetWidth || window.innerWidth;
      const height = container.offsetHeight || window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
  }

  function onDocumentMouseMove(event) {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
  }

  function animate() {
      animationId = requestAnimationFrame(animate);
      count += 0.003;
      
      if (!particles || !particles.geometry) return;

      // 让粒子缓慢波动
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin((i + count) * 0.5) * 0.3; 
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // 缓慢跟随鼠标和自动旋转
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
  }
});