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

const motherboardData = {
  ATX: { watts: 50 },
  "Micro ATX": { watts: 40 },
  "Mini-ITX": { watts: 30 },
  "Thin Mini-ITX": { watts: 25 },
  "SSI CEB": { watts: 60 },
  "SSI EEB": { watts: 70 },
};

const ramData = {
  "2GB DDR3": { watts: 3 },
  "4GB DDR3": { watts: 4 },
  "8GB DDR3": { watts: 5 },
  "32GB DDR3": { watts: 10 },
  "4GB DDR4": { watts: 3 },
  "8GB DDR4": { watts: 4 },
  "16GB DDR4": { watts: 5 },
  "32GB DDR4": { watts: 10 },
};

const ssdData = {
  "128GB": { watts: 5 },
  "512GB": { watts: 6 },
  "1TB": { watts: 7 },
  "2TB": { watts: 8 },
  "4TB": { watts: 9 },
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

class Motherboard {
  constructor(data) {
    this.data = data;
  }

  getWattsByFormFactor(formFactor) {
    return this.data[formFactor] ? this.data[formFactor].watts : 0;
  }
}

class RAM extends Component {
  constructor(data) {
    super("RAM", data);
  }

  getWattsByModel(model) {
    return this.data[model] ? this.data[model].watts : 0;
  }
}

class SSD {
  constructor(data) {
    this.data = data; // База даних SSD
  }

  // Метод для отримання потужності по моделі SSD
  getWattsByModel(model) {
    return this.data[model] ? this.data[model].watts : 0;
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
    this.optionSelect.innerHTML = '<option value="">Select</option>';

    const options = this.getOptionsMethod(selectedBrand);
    populateSelectOptions(this.optionSelect, options);
  }
}

// Reset button functionality
const resetButton = document.querySelector(".btn__reset");

resetButton.addEventListener("click", function () {
  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    select.selectedIndex = 0;
  });

  updateTotalWatts();
});

//======================================================================================================
// Створення об'єктів CPU та GPU
//======================================================================================================

const cpu = new CPU(cpuData);
const gpu = new GPU(gpuData);
const motherboard = new Motherboard(motherboardData);
const ram = new RAM(ramData);
const ssd = new SSD(ssdData);

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
const gpuQuantitySelect = document.querySelector('select[name="gpu-quantity"]');

const gpuSelector = new ComponentSelector(
  gpuBrandSelect,
  gpuCardSelect,
  gpuData,
  (selectedBrand) => gpu.getModelsByBrand(selectedBrand)
);

const motherboardFormFactorSelect = document.querySelector(
  'select[name="motherboard-form-factor"]'
);
motherboardFormFactorSelect.addEventListener("change", updateTotalWatts);

const ramMemoryModuleSelect = document.querySelector(
  'select[name="ram-memory-module"]'
);
const ramQuantitySelect = document.querySelector('select[name="RAM-quantity"]');

const ssdModelSelect = document.querySelector('select[name="ssd-size"]');
const ssdQuantitySelect = document.querySelector('select[name="SSD-quantity"]');

//======================================================================================================
// Обробка вибору сокета для CPU
//======================================================================================================

socketSelect.addEventListener("change", function () {
  const selectedSocket = socketSelect.value;
  modelSelect.innerHTML = '<option value="">Select</option>';
  const models = cpu.getModelsBySocket(cpuBrandSelect.value, selectedSocket);
  populateSelectOptions(modelSelect, models);
});

// Змінні для вибору брендів
const brandSelectCpu = document.querySelector('select[name="cpu-brand"]');
const brandSelectGpu = document.querySelector('select[name="gpu-brand"]');

//======================================================================================================
// Лічильник ват
//======================================================================================================

let totalWatts = 0;

// Дані компонентів
const components = {
  cpu: {
    data: cpuData,
    select: document.querySelector('select[name="cpu-model"]'),
    brandSelect: brandSelectCpu,
    update: function () {
      return updateComponentWatts(this, this.select, this.brandSelect);
    },
  },
  gpu: {
    data: gpuData,
    select: document.querySelector('select[name="gpu-graphic-card"]'),
    brandSelect: brandSelectGpu,
    quantitySelect: gpuQuantitySelect,
    update: function () {
      return updateComponentWatts(
        this,
        this.select,
        this.brandSelect,
        this.quantitySelect
      );
    },
  },
  ram: {
    data: ramData,
    select: ramMemoryModuleSelect,
    quantitySelect: ramQuantitySelect,
    update: function () {
      const selectedModel = this.select.value;
      const selectedQuantity = parseInt(this.quantitySelect.value) || 1;

      return ram.getWattsByModel(selectedModel) * selectedQuantity;
    },
  },
  ssd: {
    data: ssdData,
    select: ssdModelSelect,
    quantitySelect: ssdQuantitySelect,
    update: function () {
      const selectedModel = this.select.value;
      const selectedQuantity = parseInt(this.quantitySelect.value) || 1;

      return ssd.getWattsByModel(selectedModel) * selectedQuantity;
    },
  },
};

// Метод для заповнення елементів select
function populateSelectOptions(selectElement, options) {
  const fragment = document.createDocumentFragment();
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    fragment.appendChild(opt);
  });
  selectElement.appendChild(fragment);
}

// Загальна функція для оновлення потужності компонента
function updateComponentWatts(
  component,
  selectedElement,
  brandSelect,
  quantitySelect
) {
  const selectedModel = selectedElement.value;
  const selectedBrand = brandSelect.value;
  const selectedQuantity = quantitySelect
    ? parseInt(quantitySelect.value) || 1
    : 1;

  if (selectedModel && selectedBrand) {
    const selectedItem = component.data[selectedBrand].cards
      ? component.data[selectedBrand].cards.find(
          (item) => item.model === selectedModel
        )
      : component.data[selectedBrand].models[socketSelect.value].find(
          (item) => item.model === selectedModel
        );
    return selectedItem ? selectedItem.watts * selectedQuantity : 0;
  }
  return 0;
}

// Оновлення загальної потужності
function updateTotalWatts() {
  totalWatts = 0;
  for (const component in components) {
    totalWatts += components[component].update();
  }
  totalWatts += motherboard.getWattsByFormFactor(
    motherboardFormFactorSelect.value
  );
  document.querySelector("#total-watts").textContent = ` ${totalWatts}`;
}

// Слухачі подій для компонентів
const setEventListeners = () => {
  components.cpu.select.addEventListener("change", updateTotalWatts);

  components.gpu.select.addEventListener("change", updateTotalWatts);
  components.gpu.quantitySelect.addEventListener("change", updateTotalWatts);

  ramMemoryModuleSelect.addEventListener("change", updateTotalWatts);
  ramQuantitySelect.addEventListener("change", updateTotalWatts);

  ssdModelSelect.addEventListener("change", updateTotalWatts);
  ssdQuantitySelect.addEventListener("change", updateTotalWatts);
};

setEventListeners();
