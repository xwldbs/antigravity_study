// Mock Data
const STORES = [
    {
        id: "store-1",
        name: "소림마라 명동점",
        rating: "4.9",
        deliveryTime: "20~30분",
        minOrder: 15000,
        deliveryFee: 2000,
        logo: "🌶️",
        accentColor: "#e52d27"
    },
    {
        id: "store-2",
        name: "하오바오 마라탕 강남본점",
        rating: "4.8",
        deliveryTime: "25~35분",
        minOrder: 15000,
        deliveryFee: 2000,
        logo: "🍲",
        accentColor: "#ff9100"
    },
    {
        id: "store-3",
        name: "천향록 마라전문점 홍대점",
        rating: "4.7",
        deliveryTime: "15~25분",
        minOrder: 15000,
        deliveryFee: 2000,
        logo: "🥡",
        accentColor: "#7d0b0e"
    }
];

const MENU_ITEMS = {
    basic: [
        { id: "b1", name: "숙주나물 (100g)", price: 1000, icon: "🌱", soldOut: false },
        { id: "b2", name: "청경채 (100g)", price: 1500, icon: "🥬", soldOut: false },
        { id: "b3", name: "배추 (100g)", price: 1500, icon: "🥬", soldOut: false },
        { id: "b4", name: "팽이버섯 (100g)", price: 1000, icon: "🍄", soldOut: false },
        { id: "b5", name: "새송이버섯 (100g)", price: 1200, icon: "🍄", soldOut: false },
        { id: "b6", name: "푸주 (80g)", price: 2000, icon: "🥖", soldOut: false },
        { id: "b7", name: "건두부 (80g)", price: 1800, icon: "🥞", soldOut: true } // 품절 데모용
    ],
    noodle: [
        { id: "n1", name: "분모자 (3줄)", price: 2500, icon: "🍜", soldOut: false },
        { id: "n2", name: "중국당면 (4줄)", price: 2000, icon: "🥢", soldOut: false },
        { id: "n3", name: "옥수수면 (100g)", price: 1500, icon: "🍝", soldOut: false },
        { id: "n4", name: "라면사리 (1개)", price: 1000, icon: "🍜", soldOut: true } // 품절 데모용
    ],
    skewer: [
        { id: "s1", name: "소시지 꼬치 (2개)", price: 1500, icon: "🍢", soldOut: false },
        { id: "s2", name: "문어완자 꼬치 (2개)", price: 1500, icon: "🍡", soldOut: false },
        { id: "s3", name: "새우완자 꼬치 (2개)", price: 2000, icon: "🍤", soldOut: false },
        { id: "s4", name: "치즈떡 꼬치 (3개)", price: 1500, icon: "🍡", soldOut: false }
    ]
};

// Application State
const state = {
    currentStep: "menu",
    address: "서울시 강남구 테헤란로 152 (기본 배송지)",
    selectedStore: STORES[0],
    cart: {}, // { itemId: quantity }
    spiceLevel: null,
    meat: {
        beef: 0,
        mutton: 0
    },
    paymentMethod: null,
    orderNumber: "",
    deliveryTimer: null
};

// DOM Elements & Helper Methods
const doc = {
    el: (id) => document.getElementById(id),
    show: (id) => { doc.el(id).style.display = "flex"; },
    hide: (id) => { doc.el(id).style.display = "none"; },
    text: (id, val) => { doc.el(id).textContent = val; },
    val: (id) => doc.el(id).value.trim(),
    setVal: (id, val) => { doc.el(id).value = val; }
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    app.init();
});

const app = {
    init() {
        this.setupTime();
        this.bindEvents();
        
        // Initialize default store info on screen-menu
        const store = state.selectedStore;
        doc.text("menu-store-name", store.name);
        doc.text("hero-store-name", store.name);
        doc.text("hero-store-rating", store.rating);
        
        this.renderMenu("basic");
        this.updateCartUI();
    },

    setupTime() {
        const timeEl = document.querySelector(".status-bar .time");
        if (timeEl) {
            const updateClock = () => {
                const now = new Date();
                let hrs = now.getHours();
                let mins = now.getMinutes();
                hrs = hrs < 10 ? "0" + hrs : hrs;
                mins = mins < 10 ? "0" + mins : mins;
                timeEl.textContent = `${hrs}:${mins}`;
            };
            updateClock();
            setInterval(updateClock, 60000);
        }
    },

    bindEvents() {
        // Category Tab buttons
        document.querySelectorAll(".tab-button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
                e.currentTarget.classList.add("active");
                this.renderMenu(e.currentTarget.dataset.category);
            });
        });

        // Next Buttons
        doc.el("btn-go-options").addEventListener("click", () => {
            this.goToStep("options");
        });

        doc.el("btn-go-checkout").addEventListener("click", () => {
            this.goToStep("checkout");
        });

        doc.el("btn-pay-now").addEventListener("click", () => {
            this.processPayment();
        });

        doc.el("btn-reset-order").addEventListener("click", () => {
            this.resetOrder();
        });

        // Spice Level Selection radios
        document.querySelectorAll('input[name="spice-level"]').forEach(radio => {
            radio.addEventListener("change", (e) => {
                state.spiceLevel = e.target.value;
                this.validateOptionsForm();
            });
        });

        // Payment Method selection radios
        document.addEventListener("change", (e) => {
            if (e.target.name === "payment-method") {
                state.paymentMethod = e.target.value;
                doc.el("btn-pay-now").disabled = false;
            }
        });
    },

    goToStep(step) {
        // Clear old animations and hide screens
        document.querySelectorAll(".screen").forEach(s => {
            s.classList.remove("active");
        });

        state.currentStep = step;
        
        // Show current screen
        const targetScreen = doc.el(`screen-${step}`);
        targetScreen.classList.add("active");

        // Initialization hook for specific screens
        if (step === "menu") {
            this.renderMenu("basic");
            this.updateCartUI();
        } else if (step === "options") {
            this.initOptionsScreen();
        } else if (step === "checkout") {
            this.initCheckoutScreen();
        } else if (step === "tracking") {
            this.startDeliveryTracking();
        }
    },

    // Step 1: Address & Store Selection
    searchStores() {
        const address = doc.val("address-input");
        if (!address) {
            alert("배달 받으실 주소를 입력해주세요!");
            doc.el("address-input").focus();
            return;
        }

        state.address = address;
        doc.hide("store-list-placeholder");
        doc.show("store-list");

        // Render stores list
        const storeList = doc.el("store-list");
        storeList.innerHTML = "";

        STORES.forEach(store => {
            const card = document.createElement("div");
            card.className = "store-card";
            card.innerHTML = `
                <div class="store-logo-placeholder">${store.logo}</div>
                <div class="store-card-info">
                    <h3>${store.name}</h3>
                    <div class="store-card-meta">
                        <span class="rating">⭐ ${store.rating}</span>
                        <span class="divider">|</span>
                        <span>최소주문 ${store.minOrder.toLocaleString()}원</span>
                    </div>
                    <div class="store-card-details">
                        <span>🕒 ${store.deliveryTime}</span>
                        <span class="divider">·</span>
                        <span>배달팁 ${store.deliveryFee.toLocaleString()}원</span>
                    </div>
                </div>
            `;
            card.addEventListener("click", () => {
                this.selectStore(store);
            });
            storeList.appendChild(card);
        });
    },

    selectStore(store) {
        state.selectedStore = store;
        doc.text("menu-store-name", store.name);
        doc.text("hero-store-name", store.name);
        doc.text("hero-store-rating", store.rating);
        
        // Reset cart when store changes
        state.cart = {};
        this.goToStep("menu");
    },

    // Step 2: Custom Ingredient Menu
    renderMenu(category) {
        const menuList = doc.el("menu-list");
        menuList.innerHTML = "";

        const items = MENU_ITEMS[category] || [];
        
        items.forEach(item => {
            const qty = state.cart[item.id] || 0;
            const itemEl = document.createElement("div");
            itemEl.className = `menu-item ${item.soldOut ? 'sold-out' : ''}`;
            
            let actionHtml = "";
            if (item.soldOut) {
                actionHtml = `<span class="sold-out-badge">품절</span>`;
            } else {
                actionHtml = `
                    <div class="counter-control">
                        <button onclick="app.adjustCart('${item.id}', -1)">-</button>
                        <span id="qty-${item.id}" class="counter-val">${qty}</span>
                        <button onclick="app.adjustCart('${item.id}', 1)">+</button>
                    </div>
                `;
            }

            itemEl.innerHTML = `
                <div class="menu-item-icon">${item.icon}</div>
                <div class="menu-item-info">
                    <h4>${item.name}</h4>
                    <span class="menu-item-price">${item.price.toLocaleString()}원</span>
                </div>
                ${actionHtml}
            `;
            
            menuList.appendChild(itemEl);
        });
    },

    adjustCart(itemId, amount) {
        // Find item details to make sure it's valid
        let foundItem = null;
        for (const cat in MENU_ITEMS) {
            foundItem = MENU_ITEMS[cat].find(i => i.id === itemId);
            if (foundItem) break;
        }

        if (!foundItem || foundItem.soldOut) return;

        const currentQty = state.cart[itemId] || 0;
        const newQty = currentQty + amount;

        if (newQty <= 0) {
            delete state.cart[itemId];
        } else {
            state.cart[itemId] = newQty;
        }

        // Update single element immediately for snappy response
        const qtyEl = doc.el(`qty-${itemId}`);
        if (qtyEl) {
            qtyEl.textContent = state.cart[itemId] || 0;
        }

        this.updateCartUI();
    },

    updateCartUI() {
        let subtotal = 0;
        
        for (const itemId in state.cart) {
            let foundItem = null;
            for (const cat in MENU_ITEMS) {
                foundItem = MENU_ITEMS[cat].find(i => i.id === itemId);
                if (foundItem) break;
            }
            if (foundItem) {
                subtotal += foundItem.price * state.cart[itemId];
            }
        }

        // Update total price display
        doc.text("cart-total-price", `${subtotal.toLocaleString()}원`);

        // Check minimum order rule (15,000 KRW)
        const minWarning = doc.el("cart-minimum-warning");
        const goBtn = doc.el("btn-go-options");

        if (subtotal >= 15000) {
            minWarning.style.display = "none";
            goBtn.disabled = false;
        } else {
            minWarning.style.display = "block";
            minWarning.textContent = `최소 주문금액 15,000원 이상 채워주세요. (현재 부족금액: ${(15000 - subtotal).toLocaleString()}원)`;
            goBtn.disabled = true;
        }
    },

    // Step 3: Spice & Meat Additions Screen
    initOptionsScreen() {
        // Reset options
        state.spiceLevel = null;
        state.meat.beef = 0;
        state.meat.mutton = 0;

        // Uncheck radio buttons
        document.querySelectorAll('input[name="spice-level"]').forEach(radio => {
            radio.checked = false;
        });

        // Reset meat counter displays
        doc.text("beef-count", "0");
        doc.text("mutton-count", "0");

        // Calculate and show initial total
        this.updateOptionsTotal();
        this.validateOptionsForm();
    },

    adjustMeat(type, amount) {
        const val = state.meat[type] + amount;
        if (val < 0) return;
        
        state.meat[type] = val;
        doc.text(`${type}-count`, val);
        
        this.updateOptionsTotal();
    },

    getCartSubtotal() {
        let subtotal = 0;
        for (const itemId in state.cart) {
            let foundItem = null;
            for (const cat in MENU_ITEMS) {
                foundItem = MENU_ITEMS[cat].find(i => i.id === itemId);
                if (foundItem) break;
            }
            if (foundItem) {
                subtotal += foundItem.price * state.cart[itemId];
            }
        }
        return subtotal;
    },

    updateOptionsTotal() {
        const foodSubtotal = this.getCartSubtotal();
        const meatSubtotal = (state.meat.beef * 3000) + (state.meat.mutton * 3000);
        const total = foodSubtotal + meatSubtotal;

        doc.text("options-total-price", `${total.toLocaleString()}원`);
    },

    validateOptionsForm() {
        const nextBtn = doc.el("btn-go-checkout");
        if (state.spiceLevel !== null) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    },

    // Step 4: Checkout & Pay Screen
    initCheckoutScreen() {
        // Store Name & Address
        doc.text("checkout-store-name", state.selectedStore.name);
        doc.text("checkout-address-val", state.address);

        // Reset payment selection
        document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
            radio.checked = false;
        });
        doc.el("btn-pay-now").disabled = true;

        // Render food summary items list
        const itemsList = doc.el("checkout-items-list");
        itemsList.innerHTML = "";

        // 1. Ingredients list
        for (const itemId in state.cart) {
            let foundItem = null;
            for (const cat in MENU_ITEMS) {
                foundItem = MENU_ITEMS[cat].find(i => i.id === itemId);
                if (foundItem) break;
            }
            if (foundItem) {
                const qty = state.cart[itemId];
                const row = document.createElement("div");
                row.className = "checkout-item-row";
                row.innerHTML = `
                    <span>${foundItem.icon} ${foundItem.name}<span class="checkout-item-qty">x${qty}</span></span>
                    <span>${(foundItem.price * qty).toLocaleString()}원</span>
                `;
                itemsList.appendChild(row);
            }
        }

        // 2. Spice Level option
        const spiceNames = ["0단계(순한맛)", "1단계(보통맛)", "2단계(매운맛)", "3단계(아주 매운맛)", "4단계(지옥맛)"];
        const spiceRow = document.createElement("div");
        spiceRow.className = "checkout-item-row";
        spiceRow.innerHTML = `
            <span>🌶️ 매운맛: ${spiceNames[state.spiceLevel]}</span>
            <span>추가금 없음</span>
        `;
        itemsList.appendChild(spiceRow);

        // 3. Meat options
        if (state.meat.beef > 0) {
            const beefRow = document.createElement("div");
            beefRow.className = "checkout-item-row";
            beefRow.innerHTML = `
                <span>🍖 소고기 추가<span class="checkout-item-qty">x${state.meat.beef}</span></span>
                <span>${(state.meat.beef * 3000).toLocaleString()}원</span>
            `;
            itemsList.appendChild(beefRow);
        }

        if (state.meat.mutton > 0) {
            const muttonRow = document.createElement("div");
            muttonRow.className = "checkout-item-row";
            muttonRow.innerHTML = `
                <span>🥩 양고기 추가<span class="checkout-item-qty">x${state.meat.mutton}</span></span>
                <span>${(state.meat.mutton * 3000).toLocaleString()}원</span>
            `;
            itemsList.appendChild(muttonRow);
        }

        // Price calculations
        const foodPrice = this.getCartSubtotal() + (state.meat.beef * 3000) + (state.meat.mutton * 3000);
        const deliveryFee = state.selectedStore.deliveryFee;
        const totalPrice = foodPrice + deliveryFee;

        doc.text("checkout-food-price", `${foodPrice.toLocaleString()}원`);
        doc.text("checkout-total-price", `${totalPrice.toLocaleString()}원`);
    },

    processPayment() {
        // Activate payment spinner for 2 seconds
        const loader = doc.el("loading-overlay");
        loader.classList.add("active");

        setTimeout(() => {
            loader.classList.remove("active");
            
            // Generate Order Number
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            const rand = Math.floor(1000 + Math.random() * 9000);
            state.orderNumber = `M-${dateStr}-${rand}`;
            
            this.goToStep("tracking");
        }, 2000);
    },

    // Step 5: Live Delivery Status Tracker
    startDeliveryTracking() {
        // Set order number
        doc.text("order-number-val", state.orderNumber);
        
        // Hide Order Reset button initially
        doc.el("btn-reset-order").style.display = "none";

        // Reset timeline steps
        const stepCooking = doc.el("step-cooking");
        const stepDelivering = doc.el("step-delivering");
        const stepDelivered = doc.el("step-delivered");
        
        stepCooking.className = "timeline-step active";
        stepDelivering.className = "timeline-step";
        stepDelivered.className = "timeline-step";

        // Map elements
        const riderPin = doc.el("map-pin-rider");
        const progressBar = doc.el("delivery-progress-line");
        
        // Phase 1: Cooking
        riderPin.style.left = "30px";
        riderPin.style.top = "45px";
        progressBar.style.strokeDashoffset = "350"; // Empty path
        doc.text("estimated-time-val", "약 40분");
        
        // Clear any previous running simulation timers
        if (state.deliveryTimer) clearTimeout(state.deliveryTimer);

        // Transition 1: Cooking -> Delivering (after 6 seconds)
        state.deliveryTimer = setTimeout(() => {
            stepCooking.className = "timeline-step completed";
            stepDelivering.className = "timeline-step active";
            
            // Move rider to mid-point on roadmap SVG
            riderPin.style.left = "150px";
            riderPin.style.top = "22px";
            progressBar.style.strokeDashoffset = "175"; // Half-filled
            doc.text("estimated-time-val", "약 15분");
            
            // Transition 2: Delivering -> Delivered (after 6 seconds)
            state.deliveryTimer = setTimeout(() => {
                stepDelivering.className = "timeline-step completed";
                stepDelivered.className = "timeline-step active";
                
                // Move rider to home pin
                riderPin.style.left = "270px";
                riderPin.style.top = "75px";
                progressBar.style.strokeDashoffset = "0"; // Fully-filled
                doc.text("estimated-time-val", "배달 완료");
                
                // Display Order Reset button
                doc.el("btn-reset-order").style.display = "block";
            }, 6000);

        }, 6000);
    },

    resetOrder() {
        if (state.deliveryTimer) clearTimeout(state.deliveryTimer);
        
        state.address = "서울시 강남구 테헤란로 152 (기본 배송지)";
        state.selectedStore = STORES[0];
        state.cart = {};
        state.spiceLevel = null;
        state.meat.beef = 0;
        state.meat.mutton = 0;
        state.paymentMethod = null;
        state.orderNumber = "";

        // Re-initialize default store info on screen-menu
        const store = state.selectedStore;
        doc.text("menu-store-name", store.name);
        doc.text("hero-store-name", store.name);
        doc.text("hero-store-rating", store.rating);

        this.goToStep("menu");
    }
};
