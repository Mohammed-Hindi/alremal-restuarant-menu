Vue.component("header-component", {
  template: `
     <div class="restaurant-header">
        <div class=" text-center position-relative">
            <a href="#" class="logo">
                <img class="logo-img" src="image/logo-header.webp"  alt="logo">
            </a>
        </div>
    </div>
    `,
  data() {
    return {};
  },
});

Vue.component("main-component", {
  props: ["productMain", "productAppetizers", "productDrinks"],
  data() {
    return {
      selectedCategory: "main",
    };
  },
  computed: {
    filteredProducts() {
      if (this.selectedCategory === "main") return this.productMain;
      if (this.selectedCategory === "appetizers") return this.productAppetizers;
      if (this.selectedCategory === "drinks") return this.productDrinks;
      return [];
    },
  },

  template: `
    <div>
      <!-- Navigation -->
      <div class="container-fluid my-4">
        <ul class="nav nav-pills nav-justified mb-3">
          <li class="nav-item">
            <button class="nav-link" 
                    :class="{ active: selectedCategory === 'main' }" 
                    @click="selectedCategory = 'main'">
              الوجبات الرئيسية
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" 
                    :class="{ active: selectedCategory === 'appetizers' }" 
                    @click="selectedCategory = 'appetizers'">
              المقبلات
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" 
                    :class="{ active: selectedCategory === 'drinks' }" 
                    @click="selectedCategory = 'drinks'">
              المشروبات
            </button>
          </li>
        </ul>
      </div>

      <!-- Products Grid -->
      <div class="container">
        <h2 class="category-title">
          {{ selectedCategory === 'main' ? 'وجبات رئيسية' : selectedCategory === 'appetizers' ? 'المقبلات' : 'المشروبات' }}
        </h2>

        <div class="row g-4">
          <div class="col-md-6 col-lg-4" v-for="product in filteredProducts" :key="product.id">
            <div class="product-card">
              <img :src="product.image" class="product-image" :alt="product.name" />
              <div class="card-body p-3">
                <h5 class="card-title  mb-2">{{ product.name }}</h5>
                <p class="price-tag">{{ product.price }} ₪</p>
                <button @click="$emit('add-to-cart', product)" class="btn btn-accent w-100 mt-2">أضف للطلب</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
});

Vue.component("cart-component", {
  props: ["cart", "customer"],
  data() {
    return {
      showCart: false,
      localCustomer: { ...this.customer },
    };
  },
  computed: {
    totalItems() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },
    cartTotal() {
      return this.cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
    },
  },
  methods: {
    resetForm() {
      this.localCustomer = {
        name: "",
        table: "",
        phone: "",
        notes: "",
        payment: "",
      };
      this.$emit("reset-cart");
      this.showCart = false;
    },
    increaseQuantity(item) {
      if (!item.quantity) item.quantity = 1;
      item.quantity++;
    },

    decreaseQuantity(item) {
      if (!item.quantity) item.quantity = 1;
      if (item.quantity > 1) {
        item.quantity--;
      }
    },
    submitOrder() {
      const newOrder = {
        id: Date.now(),
        customer: { ...this.localCustomer },
        items: [...this.cart],
        total: this.cartTotal,
        date: new Date().toLocaleTimeString(),
        status: "pending",
      };

      fetch("save_order.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      })
        .then((res) => res.json())
        .then((data) => {
          alert("تم إرسال الطلب بنجاح");
          this.resetForm();
        })
        .catch((err) => {
          console.error("خطأ في إرسال الطلب", err);
          alert("حدث خطأ أثناء إرسال الطلب");
        });
    },
  },
  template: `
    <div>
      <!-- Floating Cart Icon -->
      <div class="floating-cart" @click="showCart = !showCart">
        <i class="fas fa-shopping-cart fa-lg"></i>
        <span class="cart-badge">{{ totalItems }}</span>
      </div>

      <!-- Modal using Vue -->
      <div v-if="showCart" class="checkout-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background: rgba(0,0,0,0.5); z-index: 1050;">
        <div class="modal-dialog modal-xl">
          <div class="modal-content" style="border-radius:20px; box-shadow: var(--card-shadow);">
            <!-- Header -->
            <div class="modal-header">
              <h5 class="modal-title">طلبك</h5>
              <button type="button" class="btn-close" @click="showCart = false" style="filter: brightness(0) invert(1);"></button>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <!-- Cart Items -->
              <div v-if="cart.length === 0" class="text-center py-4">
                <p>السلة فارغة</p>
              </div>
              <div v-else>
                <div v-for="item in cart" :key="item.product.id" class="d-flex justify-content-between align-items-center mb-2">
                  <div>{{ item.product.name }} (x{{ item.quantity }})
                  <button class="btn btn-sm btn-success" @click="increaseQuantity(item)">+</button>
                 <button class="btn btn-sm btn-danger" @click="decreaseQuantity(item)">-</button>
                  </div>
                  <div>{{ (item.product.price * item.quantity).toFixed(2) }} ₪</div>
                </div>

                <div class="border-top pt-3 mt-3 mb-4">
                  <h5>المجموع: {{ cartTotal.toFixed(2) }} ₪</h5>
                </div>
              </div>

              <!-- Form -->
              <form>
                <div class="mb-3">
                  <label class="form-label">الاسم</label>
                  <input type="text" class="form-control form-control-lg" v-model="localCustomer.name" placeholder="أدخل اسمك">
                </div>

                <div class="mb-3">
                  <label class="form-label">رقم الطاولة</label>
                  <input type="text" class="form-control form-control-lg" v-model="localCustomer.table" placeholder="مثال: 5">
                </div>

                <div class="mb-3">
                  <label class="form-label">رقم الجوال</label>
                  <input type="tel" class="form-control form-control-lg" v-model="localCustomer.phone" placeholder="مثال: 05xxxxxxxx">
                </div>

                <div class="mb-3">
                  <label class="form-label">ملاحظات إضافية</label>
                  <textarea class="form-control" rows="2" v-model="localCustomer.notes"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">طريقة الدفع</label>
                  <select class="form-select" v-model="localCustomer.payment">
                    <option value="cash">نقدًا عند الاستلام</option>
                    <option value="card">بطاقة</option>
                    <option value="online">دفع إلكتروني</option>
                  </select>
                </div>

                <div class="d-flex justify-content-start gap-3 mt-3">
                    <button type="button" class="btn btn-primary btn-lg" @click="submitOrder">تأكيد الطلب</button>
                    <button type="button" class="btn btn-danger btn-lg" @click="resetForm">ازالة الطلب</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
});

Vue.component("footer-component", {
  template: `
<footer class="footer-section mt-5 mb-0">
  <div class="container-fluid py-4 text-center">

    <!-- Logo -->
    <img src="image/logo-footer.webp" alt="Logo" class="footer-logo img-fluid w-100">

  </div>
</footer>
  `,
});

var App = new Vue({
  el: "#App",
  data: {
    productMain: [
      {
        id: 1,
        name: "دجاج مندي",
        price: 35.0,
        image: "image/chicken-mandie.webp",
      },
      { id: 2, name: "رز يمني", price: 25.0, image: "image/riz-yemeni.webp" },
      { id: 3, name: "كبسة لحم", price: 40.0, image: "image/lamb-curry.webp" },
    ],
    productAppetizers: [
      { id: 1, name: "سلطة خضراء", price: 15.0, image: "image/salad.webp" },
      { id: 2, name: "حمص بالطحينة", price: 20.0, image: "image/hummus.webp" },
      {
        id: 3,
        name: "متبل باذنجان",
        price: 18.0,
        image: "image/mutabal.webp",
      },
    ],
    productDrinks: [
      {
        id: 1,
        name: "عصير برتقال",
        price: 10.0,
        image: "image/orange-juice.webp",
      },
      {
        id: 2,
        name: "عصير ليمون",
        price: 12.0,
        image: "image/lemon-juice.webp",
      },
      {
        id: 3,
        name: "عصير رمان",
        price: 15.0,
        image: "image/pomegranate-juice.webp",
      },
    ],
    selectedCategory: "main",
    cart: [],
    showCart: false,
    customer: {
      name: "",
      table: "",
      phone: "",
      notes: "",
      payment: "",
    },
    orders: [],
  },
  methods: {
    addToCart(product) {
      const existingItem = this.cart.find(
        (item) => item.product.id === product.id,
      );
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.cart.push({ product, quantity: 1 });
      }
      console.log(this.cart);
    },
  },

  component: {},
});
