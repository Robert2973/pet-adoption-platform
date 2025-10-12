<template>
<v-container fluid class="pa-0" style="background: linear-gradient(135deg, #fff4f7 0%, #ffeef3 100%); min-height: 100vh;">
    <!-- BANNER PARALLAX PRINCIPAL -->
    <v-parallax
      src="https://images.contentstack.io/v3/assets/blt66d7bca2bc8b988c/blt19b360b7289400e9/60528f106d24ea4cb9b5805b/085_dogs_and_cats_pink_background.jpg?width=2048&quality=auto&auto=webp"
      height="100%"
      width="100%"
      contain
    >
      <v-row class="fill-height" align="center" justify="center" style="color:blue">
        <v-col cols="12" class="text-center white--text">
          <h1 class="display-2 font-weight-bold animate__animated animate__fadeInDown white--text">
            ¡Adopta y cambia vidas!
          </h1>
          <p class="subtitle-1 animate__animated animate__fadeInUp">
            Encuentra a tu compañero ideal y aprende a cuidarlo correctamente.
          </p>
          <v-btn
            color="pink"
            dark
            large
            class="mt-4 animate__animated animate__bounceIn"
            to="/catalog"
          >
            Ver Catálogo
          </v-btn>
        </v-col>
      </v-row>
    </v-parallax>

    <!-- BENEFICIOS DE ADOPTAR -->
    <v-container class="mt-12">
      <h2 class="text-center mb-6 font-weight-bold">Beneficios de Adoptar</h2>
      <v-row dense>
        <v-col v-for="(benefit, i) in benefits" :key="i" cols="12" md="3">
          <v-card class="pa-4 parallax-card hover-bg-color scroll-animate" outlined>
            <v-icon color="pink" size="48">{{ benefit.icon }}</v-icon>
            <h3 class="mt-2 font-weight-medium">{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- CARRUSEL DE MASCOTAS -->
    <v-container class="mt-12">
      <h2 class="text-center mb-6 font-weight-bold">Mascotas Disponibles</h2>
      <v-carousel hide-delimiters height="520" cycle show-arrows-on-hover>
        <v-carousel-item v-for="(pet, i) in pets" :key="i">
          <v-sheet
            class="d-flex flex-column align-center justify-center rounded-lg elevation-10 hover-scale hover-bg-color parallax-card"
            height="100%"
            color="#fff3f3"
          >
            <v-img
            :src="pet.photo"
            height="200"
            width="100%"
            contain
            class="rounded-lg hover-scale-img"
          ></v-img>
            <h3 class="font-weight-medium mt-2">{{ pet.name }}</h3>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-container>

    <!-- ESTADÍSTICAS -->
    <v-container class="mt-12">
      <h2 class="text-center mb-6 font-weight-bold">Nuestra Comunidad</h2>
      <v-row justify="center">
        <v-col v-for="(stat, i) in stats" :key="i" cols="12" md="3">
          <v-card class="pa-6 text-center elevation-5 hover-elevation-12 scroll-animate">
            <v-icon size="64" color="pink">{{ stat.icon }}</v-icon>
            <h3 class="font-weight-bold mt-2">{{ stat.value }}</h3>
            <p>{{ stat.title }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- TIPOS DE MASCOTAS EXTENDIDO -->
    <v-container class="mt-12">
      <h2 class="text-center mb-6 font-weight-bold">Tipos de Mascotas</h2>
      <v-row dense>
        <v-col v-for="(type, i) in petTypes" :key="i" cols="12" md="4">
          <v-card class="pa-4 parallax-card hover-bg-color scroll-animate">
            <v-img
              :src="type.image"
              height="180"
              class="rounded-lg mb-3 hover-scale-img"
            ></v-img>
            <h3 class="font-weight-medium">{{ type.name }}</h3>
            <p class="text-justify">{{ type.description }}</p>
            <p class="text-justify">{{ type.extended }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- CUIDADO Y SALUD EXTENDIDO -->
    <v-container class="mt-12">
      <h2 class="text-center mb-6 font-weight-bold">Cuidado y Salud</h2>
      <v-row dense>
        <v-col v-for="(tip, i) in careTips" :key="i" cols="12" md="4">
          <v-card class="pa-4 parallax-card hover-bg-color scroll-animate">
            <v-img
              :src="tip.image"
              height="180"
              class="rounded-lg mb-3 hover-scale-img"
            ></v-img>
            <h3 class="font-weight-medium">{{ tip.title }}</h3>
            <p class="text-justify">{{ tip.description }}</p>
            <p class="text-justify">{{ tip.extended }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- MEDICINA PREVENTIVA EXTENDIDO -->
    <v-container class="mt-12">
      <h2 class="text-center mb-6 font-weight-bold">Medicina Preventiva</h2>
      <v-row dense>
        <v-col v-for="(med, i) in medicalTips" :key="i" cols="12" md="4">
          <v-card class="pa-4 parallax-card hover-bg-color scroll-animate">
            <v-img
              :src="med.image"
              height="180"
              class="rounded-lg mb-3 hover-scale-img"
            ></v-img>
            <h3 class="font-weight-medium">{{ med.title }}</h3>
            <p class="text-justify">{{ med.description }}</p>
            <p class="text-justify">{{ med.extended }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ENTRENAMIENTO Y SOCIALIZACIÓN EXTENDIDO -->
    <v-container class="mt-12">
      <h2 class="text-center mb-6 font-weight-bold">Entrenamiento y Socialización</h2>
      <v-row dense>
        <v-col v-for="(train, i) in trainingTips" :key="i" cols="12" md="4">
          <v-card class="pa-4 parallax-card hover-bg-color scroll-animate">
            <v-img
              :src="train.image"
              height="180"
              class="rounded-lg mb-3 hover-scale-img"
            ></v-img>
            <h3 class="font-weight-medium">{{ train.title }}</h3>
            <p class="text-justify">{{ train.description }}</p>
            <p class="text-justify">{{ train.extended }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- CONVIVENCIA Y SEGURIDAD EXTENDIDO -->
    <v-container class="mt-12 mb-12">
      <h2 class="text-center mb-6 font-weight-bold">Convivencia y Seguridad en Casa</h2>
      <v-row dense>
        <v-col v-for="(home, i) in homeTips" :key="i" cols="12" md="4">
          <v-card class="pa-4 parallax-card hover-bg-color scroll-animate">
            <v-img
              :src="home.image"
              height="180"
              class="rounded-lg mb-3 hover-scale-img"
            ></v-img>
            <h3 class="font-weight-medium">{{ home.title }}</h3>
            <p class="text-justify">{{ home.description }}</p>
            <p class="text-justify">{{ home.extended }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- TESTIMONIOS -->
    <v-container class="mt-12 mb-12">
      <h2 class="text-center mb-6 font-weight-bold">Testimonios</h2>
      <v-row dense>
        <v-col v-for="(testimonial, i) in testimonials" :key="i" cols="12" md="4">
          <v-card class="pa-4 parallax-card hover-bg-color scroll-animate">
            <v-avatar size="64" class="mb-3">
              <v-img :src="testimonial.avatar"></v-img>
            </v-avatar>
            <p>"{{ testimonial.message }}"</p>
            <p class="font-weight-bold mt-2">{{ testimonial.name }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- GAMIFICACIÓN -->
    <v-container class="mt-12 mb-12">
      <v-sheet class="pa-6 text-center rounded-lg elevation-5 scroll-animate" color="#fff3f3">
        <v-icon size="64" color="pink">mdi-star-circle</v-icon>
        <h2 class="font-weight-bold mt-4">Gana puntos por adoptar</h2>
        <p>
          Cada adopción te da puntos que puedes usar para desbloquear recompensas, acceder a eventos especiales y más.
        </p>
        <v-btn color="pink" outlined class="mt-4" @click="showPointsInfo = !showPointsInfo">
          ¿Cómo funciona?
        </v-btn>
        <v-expand-transition>
          <div v-if="showPointsInfo" class="mt-4 text-center">
            <ul class="centered-list">
              <li>Adopta una mascota → 20 puntos</li>
              <li>Comparte en redes sociales → 50 puntos</li>
            </ul>
          </div>
        </v-expand-transition>
      </v-sheet>
    </v-container>

  </v-container>
</template>

<script>
export default {
  data() {
    return {
      showPointsInfo: false,
      pets: [
        { name: 'Firulais', species: 'Perro', age: 'Joven', photo: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=800&q=80' },
        { name: 'Michi', species: 'Gato', age: 'Adulto', photo: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80' },
        { name: 'Luna', species: 'Perro', age: 'Cachorro', photo: 'https://images.unsplash.com/photo-1625316708582-7c38734be31d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { name: 'Max', species: 'Perro', age: 'Adulto', photo: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=80' },
        { name: 'Simba', species: 'Gato', age: 'Joven', photo: 'https://images.unsplash.com/photo-1667599612153-3bad18195ce5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { name: 'Rocky', species: 'Perro', age: 'Adulto', photo: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80' },
        { name: 'Nala', species: 'Gato', age: 'Cachorro', photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { name: 'Buddy', species: 'Perro', age: 'Joven', photo: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80' },
        { name: 'Lily', species: 'Gato', age: 'Adulto', photo: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
        { name: 'Charlie', species: 'Perro', age: 'Cachorro', photo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80' },
      ],
      benefits: [
        { icon: 'mdi-paw', title: 'Variedad de mascotas', description: 'Perros, gatos y más esperando un hogar.' },
        { icon: 'mdi-heart', title: 'Salva vidas', description: 'Cada adopción significa una segunda oportunidad.' },
        { icon: 'mdi-star', title: 'Gana recompensas', description: 'Acumula puntos y desbloquea beneficios por adoptar.' },
        { icon: 'mdi-school', title: 'Aprende sobre mascotas', description: 'Consejos y educación para cuidar mejor a tu compañero.' },
      ],
      stats: [
        { icon: 'mdi-paw', value: '120', title: 'Mascotas adoptadas' },
        { icon: 'mdi-account-group', value: '300', title: 'Voluntarios' },
        { icon: 'mdi-star', value: '4500', title: 'Puntos acumulados' },
      ],
      petTypes: [
        { image: 'https://images.unsplash.com/photo-1518887499460-71d222eed89d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: 'Perros', description: 'Leales, cariñosos y excelentes compañeros de vida.', extended: 'Los perros necesitan ejercicio diario, socialización con otras mascotas y entrenamiento básico para ser felices y equilibrados. Cada raza tiene necesidades específicas, como cuidado del pelaje y alimentación adaptada a su tamaño y edad.' },
        { image: 'https://images.unsplash.com/photo-1748992341389-fdc5c204ad13?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: 'Gatos', description: 'Independientes, curiosos y juguetones.', extended: 'Los gatos requieren espacio seguro para explorar, rascadores para mantener sus uñas saludables, y vigilancia sobre su alimentación. Es importante vacunarlos y esterilizarlos para evitar enfermedades y sobrepoblación.' },
        { image: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: 'Otros animales', description: 'Conejos, aves y más.', extended: 'Cada especie requiere cuidados distintos: dieta balanceada, higiene adecuada, jaulas amplias y enriquecimiento ambiental. Aprender sobre sus hábitos naturales es clave para su bienestar.' },
      ],
      careTips: [
        { image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Alimentación Saludable', description: 'Aprende a darles la dieta adecuada según su edad y especie.', extended: 'Incluye proteínas de calidad, vegetales y suplementos necesarios. Evita alimentos tóxicos como chocolate, cebolla o huesos cocidos. Mantén agua fresca disponible en todo momento.' },
        { image: 'https://plus.unsplash.com/premium_photo-1663133844035-aedd7ddcfca8?q=80&w=1159&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Ejercicio Diario', description: 'Mantén a tu mascota activa y feliz.', extended: 'El ejercicio físico previene obesidad, mejora la digestión y reduce el estrés. Paseos diarios, juegos interactivos y tiempo de calidad fortalecen el vínculo entre dueño y mascota.' },
        { image: 'https://images.unsplash.com/photo-1660836441635-71d1ad29e8de?q=80&w=1413&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Higiene y Limpieza', description: 'Cepillado, baños y cuidado dental.', extended: 'El cepillado regular evita nudos y mantiene el pelaje brillante. Los baños deben ser adecuados para su tipo de piel. Limpieza dental y cuidado de oídos previenen enfermedades comunes.' },
      ],
      medicalTips: [
        { image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80', title: 'Vacunas al Día', description: 'Protege a tu mascota de enfermedades comunes.', extended: 'Las vacunas básicas incluyen rabia, parvovirus y moquillo para perros, y panleucopenia y calicivirus para gatos. Mantener un calendario de vacunación actualizado es vital para prevenir brotes.' },
        { image: 'https://plus.unsplash.com/premium_photo-1661954422066-36639b6f13b5?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Chequeos Veterinarios', description: 'Visitas periódicas al veterinario.', extended: 'Realiza chequeos cada 6-12 meses según la edad y especie. Detectar problemas temprano aumenta la esperanza de vida y evita complicaciones graves.' },
        { image: 'https://images.unsplash.com/photo-1647002380359-9441b5393673?q=80&w=1369&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Medicamentos Preventivos', description: 'Uso de antiparasitarios y suplementos.', extended: 'Aplica antipulgas, desparasitantes y suplementos vitamínicos según indicaciones veterinarias. Mantener su salud preventiva reduce riesgos de enfermedades y mejora la calidad de vida.' },
      ],
      trainingTips: [
        { image: 'https://images.unsplash.com/photo-1650644967647-00d3a24f6dae?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Entrenamiento Básico', description: 'Obediencia y hábitos saludables.', extended: 'Enseñar comandos simples como “sentado”, “quieto” y “venir” fortalece la comunicación y la confianza entre dueño y mascota. Recompensas y paciencia son claves.' },
        { image: 'https://images.unsplash.com/photo-1638766211363-96560786b7c1?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Socialización', description: 'Interacción con personas y animales.', extended: 'Exponer a la mascota a nuevas personas, otros animales y entornos reduce la ansiedad y evita comportamientos agresivos o temerosos.' },
        { image: 'https://images.unsplash.com/photo-1669822293673-d321743f7fe8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Estimulación Mental', description: 'Juegos y ejercicios cognitivos.', extended: 'Rompecabezas, juguetes interactivos y cambios en la rutina ayudan a mantener la mente activa, reduciendo estrés y aburrimiento.' },
      ],
      homeTips: [
        { image: 'https://images.unsplash.com/photo-1641638455258-be0f99004f50?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Seguridad en Casa', description: 'Evita accidentes y adapta tu hogar.', extended: 'Protege cables, objetos pequeños y zonas peligrosas. Crea espacios seguros donde la mascota pueda descansar y jugar sin riesgos.' },
        { image: 'https://images.unsplash.com/photo-1608745250509-01665ff42018?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Convivencia Familiar', description: 'Integra a tu mascota con la familia.', extended: 'Educa a niños sobre respeto y cuidado de los animales. Fomenta rutinas conjuntas como paseos, juegos y alimentación para fortalecer vínculos.' },
        { image: 'https://images.unsplash.com/photo-1744316048387-d4ff767668e7?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Rutina y Respeto', description: 'Horarios consistentes de alimentación y descanso.', extended: 'Establecer rutinas regulares ayuda a la mascota a sentirse segura y reduce conductas indeseadas. Respeta su espacio y necesidades individuales.' },
      ],
      testimonials: [
        { avatar: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'Ana P.', message: 'Adoptar en esta plataforma fue la mejor decisión, ¡mi gato es adorable!' },
        { avatar: 'https://randomuser.me/api/portraits/men/35.jpg', name: 'Luis R.', message: 'La experiencia fue increíble y el equipo muy amable.' },
        { avatar: 'https://randomuser.me/api/portraits/women/65.jpg', name: 'Carla M.', message: 'Mi perro llegó sano y feliz. Recomiendo totalmente la plataforma.' },
      ]
    };
  },
};
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

.hover-scale-img:hover {
  transform: scale(1.1);
  transition: all 0.4s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.parallax-card {
  perspective: 1000px;
}

.parallax-card:hover {
  transform: rotateX(3deg) rotateY(3deg);
  transition: transform 0.5s ease;
}

.hover-bg-color:hover {
  background-color: #ffe6ea !important;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
  transition: all 0.4s ease;
}

.hover-elevation-12:hover {
  transition: all 0.3s ease;
  transform: translateY(-5px);
  box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.2);
}

.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s forwards;
  animation-delay: 0.2s;
}

.centered-list {
  display: inline-block;
  text-align: left;
  list-style-position: inside;
  padding: 0;
  margin: 0 auto;
}
.centered-list li {
  margin-bottom: 6px;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
