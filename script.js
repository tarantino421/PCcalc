//======================================================================================================
//DB
//======================================================================================================
const cpuData = {
  intel: {
    sockets: ["LGA1151", "LGA1200", "LGA1700"],
    models: {
      LGA1151: [
        { model: "i3-8100", watts: 65 },
        { model: "i5-9600K", watts: 95 },
        { model: "i7-9700K", watts: 95 },
      ],
      LGA1200: [
        { model: "i3-10100", watts: 65 },
        { model: "i5-10400", watts: 65 },
        { model: "i7-10700K", watts: 125 },
      ],
      LGA1700: [
        { model: "i5-12600K", watts: 125 },
        { model: "i7-12700K", watts: 190 },
        { model: "i9-12900K", watts: 250 },
      ],
    },
  },
  amd: {
    sockets: ["AM4", "AM5"],
    models: {
      AM4: [
        { model: "Ryzen 5 3600", watts: 65 },
        { model: "Ryzen 7 3700X", watts: 65 },
        { model: "Ryzen 9 3900X", watts: 105 },
      ],
      AM5: [
        { model: "Ryzen 5 7600X", watts: 105 },
        { model: "Ryzen 7 7700X", watts: 105 },
        { model: "Ryzen 9 7900X", watts: 125 },
      ],
    },
  },
};

const gpuData = {
  nvidia: {
    cards: [
      { model: "RTX 3080", watts: 320 },
      { model: "RTX 3090", watts: 350 },
      { model: "RTX 4080", watts: 320 },
    ],
  },
  amd: {
    cards: [
      { model: "RX 6800", watts: 250 },
      { model: "RX 6900XT", watts: 300 },
      { model: "RX 7900XT", watts: 300 },
    ],
  },
};

//======================================================================================================
// ООП для компонентів
//======================================================================================================

class Component {
  constructor(type, data) {
    this.type = type; // CPU, GPU, etc.
    this.data = data; // Об'єкт з даними про сокети, моделі тощо
  }

  // Метод для отримання сокетів/інших параметрів на основі бренду
  getOptionsByBrand(brand) {
    return this.data[brand];
  }
}

class CPU extends Component {
  constructor(data) {
    super("CPU", data);
  }
  getSocketsByBrand(brand) {
    return this.data[brand].sockets;
  }
  getModelsBySocket(brand, socket) {
    return this.data[brand].models[socket].map((item) => item.model); // Повертаємо тільки моделі без ват
  }
}

class GPU extends Component {
  constructor(data) {
    super("GPU", data);
  }
  getModelsByBrand(brand) {
    return this.data[brand].cards.map((item) => item.model); // Повертаємо тільки моделі без ват
  }
}

//======================================================================================================
// Загальний клас для обробки вибору компонентів
//======================================================================================================

class ComponentSelector {
  constructor(brandSelect, optionSelect, data, getOptionsMethod) {
    this.brandSelect = brandSelect;
    this.optionSelect = optionSelect;
    this.data = data;
    this.getOptionsMethod = getOptionsMethod;
    // Додаємо слухач подій
    this.brandSelect.addEventListener(
      "change",
      this.handleBrandChange.bind(this)
    );
  }

  // Обробка зміни бренду
  handleBrandChange() {
    const selectedBrand = this.brandSelect.value;
    // Очищаємо попередні опції
    this.optionSelect.innerHTML = '<option value="">Select</option>';

    // Викликаємо метод для отримання опцій на основі вибраного бренду
    const options = this.getOptionsMethod(selectedBrand);
    // Оновлюємо список опцій
    options.forEach((option) => {
      this.optionSelect.innerHTML += `<option value="${option}">${option}</option>`;
    });
  }
}

// Reset button functionality
const resetButton = document.querySelector(".btn__reset");

resetButton.addEventListener("click", function () {
  // Reset all select elements
  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    select.selectedIndex = 0; // Reset to the first option
  });

  // Recalculate the total watts after reset
  updateTotalWatts();
});

//======================================================================================================
// Створення об'єктів CPU та GPU
//======================================================================================================

const cpu = new CPU(cpuData);
const gpu = new GPU(gpuData);

//======================================================================================================
// Створення екземплярів для CPU та GPU
//======================================================================================================

const cpuBrandSelect = document.querySelector('select[name="cpu-brand"]');
const socketSelect = document.querySelector('select[name="cpu-socket"]');
const modelSelect = document.querySelector('select[name="cpu-model"]');

const cpuSelector = new ComponentSelector(
  cpuBrandSelect,
  socketSelect,
  cpuData,
  (selectedBrand) => cpu.getSocketsByBrand(selectedBrand)
);

const gpuBrandSelect = document.querySelector('select[name="gpu-brand"]');
const gpuCardSelect = document.querySelector('select[name="gpu-graphic-card"]');
const gpuQuantitySelect = document.querySelector('select[name="gpu-quantity"]'); // Додаємо вибір кількості GPU

const gpuSelector = new ComponentSelector(
  gpuBrandSelect,
  gpuCardSelect,
  gpuData,
  (selectedBrand) => gpu.getModelsByBrand(selectedBrand)
);

//======================================================================================================
// Обробка вибору сокета для CPU
//======================================================================================================

socketSelect.addEventListener("change", function () {
  const selectedSocket = socketSelect.value;

  modelSelect.innerHTML = '<option value="">Select</option>';

  if (cpuBrandSelect.value === "intel") {
    cpu.getModelsBySocket("intel", selectedSocket).forEach((model) => {
      modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
    });
  } else if (cpuBrandSelect.value === "amd") {
    cpu.getModelsBySocket("amd", selectedSocket).forEach((model) => {
      modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
    });
  }
});
// Змінні для вибору брендів
const brandSelectCpu = document.querySelector('select[name="cpu-brand"]');
const brandSelectGpu = document.querySelector('select[name="gpu-brand"]');

//======================================================================================================
// Лічильник ват
//======================================================================================================

// Змінна для загальної потужності
let totalWatts = 0;

// Дані компонентів
const components = {
  cpu: {
    data: cpuData,
    select: document.querySelector('select[name="cpu-model"]'),
    brandSelect: brandSelectCpu, // Зберігаємо вибір бренду для CPU
    update: function () {
      const selectedCpuModel = this.select.value;
      const selectedBrand = this.brandSelect.value; // Отримуємо вибраний бренд для CPU

      if (selectedCpuModel && selectedBrand) {
        const selectedCpu = this.data[selectedBrand].models[
          socketSelect.value
        ].find((item) => item.model === selectedCpuModel);
        return selectedCpu ? selectedCpu.watts : 0;
      }
      return 0;
    },
  },
  gpu: {
    data: gpuData,
    select: document.querySelector('select[name="gpu-graphic-card"]'),
    brandSelect: brandSelectGpu, // Зберігаємо вибір бренду для GPU
    quantitySelect: gpuQuantitySelect, // Вибір кількості GPU
    update: function () {
      const selectedGpuModel = this.select.value;
      const selectedBrand = this.brandSelect.value;
      const selectedQuantity = parseInt(this.quantitySelect.value) || 1; // Отримуємо кількість або 1 за замовчуванням

      if (selectedGpuModel && selectedBrand) {
        const selectedGpu = this.data[selectedBrand].cards.find(
          (item) => item.model === selectedGpuModel
        );
        return selectedGpu ? selectedGpu.watts * selectedQuantity : 0; // Множимо на кількість
      }
      return 0;
    },
  },
};

// Оновлення загальної потужності
function updateTotalWatts() {
  totalWatts = 0;

  for (const component in components) {
    totalWatts += components[component].update();
  }

  document.querySelector("#total-watts").textContent = ` ${totalWatts}`;
}

// Слухачі подій для компонентів
components.cpu.select.addEventListener("change", updateTotalWatts);
components.gpu.select.addEventListener("change", updateTotalWatts);
components.gpu.quantitySelect.addEventListener("change", updateTotalWatts); // Додаємо слухач для кількості GPU
