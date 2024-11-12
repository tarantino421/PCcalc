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
  ATX: { watts: 70 },
  "Micro ATX": { watts: 60 },
  "Mini-ITX": { watts: 30 },
  "Thin Mini-ITX": { watts: 25 },
  "SSI CEB": { watts: 60 },
  "SSI EEB": { watts: 70 },
};

const ramData = {
  "2GB DDR3": { watts: 1 },
  "4GB DDR3": { watts: 2 },
  "8GB DDR3": { watts: 3 },
  "32GB DDR3": { watts: 6 },
  "4GB DDR4": { watts: 1 },
  "8GB DDR4": { watts: 4 },
  "16GB DDR4": { watts: 6 },
  "32GB DDR4": { watts: 12 },
};

const ssdData = {
  "not installed": { watts: 0 },
  "128GB": { watts: 5 },
  "512GB": { watts: 6 },
  "1TB": { watts: 7 },
  "2TB": { watts: 8 },
  "4TB": { watts: 9 },
};

const hddData = {
  "not installed": { watts: 0 },
  "500GB": { watts: 7 },
  "1TB": { watts: 8 },
  "2TB": { watts: 9 },
  "4TB": { watts: 10 },
  "8TB": { watts: 11 },
};

const opticalDriveData = {
  "not installed": { watts: 0 },
  CD: { watts: 15 },
  DVD: { watts: 20 },
  BluRay: { watts: 30 },
};

//======================================================================================================
// ООП для компонентів
//======================================================================================================

class Component {
  constructor(type, data) {
    this.type = type; // CPU, GPU, etc.
    this.data = data; 
  }


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
    return this.data[brand].models[socket].map((item) => item.model); 
  }
}

class GPU extends Component {
  constructor(data) {
    super("GPU", data);
  }
  getModelsByBrand(brand) {
    return this.data[brand].cards.map((item) => item.model); 
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
    this.data = data; 
  }

  getWattsBySize(size, quantity = 1) {
    const ssd = this.data[size];
    if (ssd) {
      return ssd.watts * quantity;
    }
    return 0;
  }
}

// Створення класу HDD
class HDD {
  constructor(data) {
    this.data = data; 
  }

  getWattsBySize(size, quantity = 1) {
    const hdd = this.data[size];
    if (hdd) {
      return hdd.watts * quantity;
    }
    return 0;
  }
}

class OpticalDrive {
  constructor(data) {
    this.data = data;
  }

  getWattsByType(type) {
    const opticalDrive = this.data[type];
    if (opticalDrive) {
      return opticalDrive.watts;
    }
    return 0;
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
const hdd = new HDD(hddData);
const opticalDrive = new OpticalDrive(opticalDriveData);

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

const ssdModelSelect = document.querySelector('select[name="ssd-model"]');
const ssdQuantitySelect = document.querySelector('select[name="SSD-quantity"]');

const hddModelSelect = document.querySelector('select[name="hdd-model"]');
const hddQuantitySelect = document.querySelector('select[name="HDD-quantity"]');

const opticalDriveSelect = document.querySelector(
  'select[name="optical-drive-type"]'
);

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
      return updateComponentWatts(this, this.select, null, this.quantitySelect); 
    },
  },
};


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

function updateComponentWatts(
  component,
  selectedElement,
  brandSelect,
  quantitySelect
) {
  const selectedModel = selectedElement.value;
  const selectedBrand = brandSelect ? brandSelect.value : null;
  const selectedQuantity = quantitySelect
    ? parseInt(quantitySelect.value) || 1
    : 1;

  if (selectedModel) {
    if (selectedBrand) {
      // Для CPU та GPU
      const selectedItem = component.data[selectedBrand].cards
        ? component.data[selectedBrand].cards.find(
            (item) => item.model === selectedModel
          )
        : component.data[selectedBrand].models[socketSelect.value].find(
            (item) => item.model === selectedModel
          );
      return selectedItem ? selectedItem.watts * selectedQuantity : 0;
    } else {
      // Для RAM
      const ramWatts = component.data[selectedModel]
        ? component.data[selectedModel].watts * selectedQuantity
        : 0;

      return ramWatts;
    }
  }
  return 0;
}

function updateTotalWatts() {
  totalWatts = 0;
  for (const component in components) {
    totalWatts += components[component].update();
  }
  totalWatts += motherboard.getWattsByFormFactor(
    motherboardFormFactorSelect.value
  );

  // Оновлюємо потужність SSD
  const ssdSize = ssdModelSelect.value;
  const ssdQuantity = parseInt(ssdQuantitySelect.value) || 1;
  totalWatts += ssd.getWattsBySize(ssdSize, ssdQuantity);

  // Оновлюємо потужність HDD
  const hddSize = hddModelSelect.value;
  const hddQuantity = parseInt(hddQuantitySelect.value) || 1;
  totalWatts += hdd.getWattsBySize(hddSize, hddQuantity);

  const opticalDriveType = opticalDriveSelect.value;
  totalWatts += opticalDrive.getWattsByType(opticalDriveType);

  document.querySelector("#total-watts").textContent = ` ${totalWatts}`;
}


const setEventListeners = () => {
  components.cpu.select.addEventListener("change", updateTotalWatts);

  components.gpu.select.addEventListener("change", updateTotalWatts);
  components.gpu.quantitySelect.addEventListener("change", updateTotalWatts);

  components.ram.select.addEventListener("change", updateTotalWatts);
  components.ram.quantitySelect.addEventListener("change", updateTotalWatts);

  ssdModelSelect.addEventListener("change", updateTotalWatts);
  ssdQuantitySelect.addEventListener("change", updateTotalWatts);

  hddModelSelect.addEventListener("change", updateTotalWatts);
  hddQuantitySelect.addEventListener("change", updateTotalWatts);

  opticalDriveSelect.addEventListener("change", updateTotalWatts);
};

setEventListeners();
