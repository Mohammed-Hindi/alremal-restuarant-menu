Vue.component("login-component", {
  data() {
    return {
      loginUser: "",
      loginPass: "",
      errorMessage: "",
      orders: [],
    };
  },
  props: ["isAdmin"],
  methods: {
    checkLogin() {
      if (this.loginUser === "Admin" && this.loginPass === "123456") {
        this.$emit("login-success");
        this.loginUser = "";
        this.loginPass = "";
      } else {
        this.errorMessage = "اسم المستخجم او كلمةالمرور غير صحيحة";
      }
    },
  },
  template: `
        <div v-if="!isAdmin" class="container">
  <div class="row justify-content-center align-items-center vh-100">
    <div class="col-12  col-md-6 col-lg-6">
      <div class="card shadow p-4">
        <h2 class="text-center mb-4">تسجيل دخول الكاشير</h2>
        
        <div class="mb-3">
          <input v-model="loginUser" type="text" class="form-control form-control-lg" placeholder="اسم المستخدم">
        </div>
        
        <div class="mb-3">
          <input v-model="loginPass" type="password" class="form-control form-control-lg" placeholder="كلمة المرور">
        </div>
        <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>   
        
        <button class="login btn btn-primary w-100 btn-lg" @click="checkLogin">دخول</button>
      </div>
    </div>
  </div>
</div>

    `,
});

Vue.component("table-component", {
  props: ["isAdmin", "orders"],
  methods: {
    sendToWhatsApp(order) {
      const itemsList = order.items
        .map((item) => `${item.product.name} x${item.quantity}`)
        .join("\n");

      const message = `طلب جديد:
العميل: ${order.customer.name}
رقم الطاولة: ${order.customer.table}
الهاتف: ${order.customer.phone}
ملاحظات: ${order.customer.notes}
طريقة الدفع: ${order.customer.payment}
الأصناف:
${itemsList}
المجموع: ${order.total.toFixed(2)} ₪`;

      const phoneNumber = "972595408415";
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    },

    updateOrderStatus(index, status) {
      Vue.set(this.orders[index], "status", status);
      localStorage.setItem("orders", JSON.stringify(this.orders));
    },

    deleteOrder(index) {
      this.$emit("delete-order", index);
    },
   
  },
  template: `
        <div v-if="isAdmin" class="dashboard-orders container mt-4">
  <h2 class="mb-3 text-center">الطلبات الجديدة</h2>

  <div class="table-responsive">
    <table class="table table-striped table-bordered align-middle text-center">
      <thead class="table-dark">
        <tr>
          <th>العميل</th>
          <th>الطلب</th>
          <th>رقم الطاولة</th>
          <th>الهاتف</th>
          <th>الملاحظات</th>
          <th>طريقة الدفع</th>
          <th>المجموع</th>
          <th>الحالة</th>
          <th>التحكم</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(order, index) in orders" :key="index">
          <td>{{ order.customer.name }}</td>
          <td>
            <ul class="list-unstyled mb-0">
                <li v-for="item in order.items" :key="item.product.id">
                {{ item.product.name }} x{{ item.quantity }}
                 
                </li>
            </ul>
          </td>
          <td>{{ order.customer.table }}</td>
          <td>{{ order.customer.phone }}</td>
          <td>{{ order.customer.notes }}</td>
          <td>{{ order.customer.payment }}</td>
          <td>{{ order.total.toFixed(2) }} ₪</td>
          <td>{{order.status || "جديد"}}</td>
          <td>
            <button class="btn btn-success btn-sm" @click="sendToWhatsApp(order)">
              واتساب
            </button>
            <button class="btn btn-primary btn-sm" @click="updateOrderStatus(index, 'جاهز')">
              جاهز
            </button>
            <button class="btn btn-danger btn-sm" @click="deleteOrder(index)">
              حذف
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

    `,
});

var dashboard = new Vue({
  el: "#Dashboard",
  data: {
    isAdmin: localStorage.getItem("isAdmin") === "true",
    orders: [],
  },

  mounted() {
    this.fetchOrders();
    setInterval(this.fetchOrders, 3000); // تحديث كل 3 ثواني
  },

  methods: {
    fetchOrders() {
      fetch("get_orders.php")
        .then(res => res.json())
        .then(data => {
          this.orders = data;
        });
    },

    handleLogin() {
      this.isAdmin = true;
      localStorage.setItem("isAdmin", "true");
    },

    logoutAdmin() {
      this.isAdmin = false;
      localStorage.removeItem("isAdmin");
    },

    updateOrderStatus(index, status) {
      this.orders[index].status = status;
      this.saveAllOrders();
    },

    deleteOrder(index) {
      this.orders.splice(index, 1);
      this.saveAllOrders();
    },

    saveAllOrders() {
      fetch("save_all_orders.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.orders),
      });
    },
  },
});
