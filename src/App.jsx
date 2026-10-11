import { useState } from "react";
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [role, setRole] = useState("");
  const [register, setRegister] = useState(false);

  const [farmerDashboard, setFarmerDashboard] = useState(false);
  const [buyerLoggedIn, setBuyerLoggedIn] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const [lastOrder, setLastOrder] = useState({
    amount: 0,
    paymentMethod: "",
    city: "",
  });

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "Cash on Delivery",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    location: "",
  });

  const API_URL = "http://localhost:8080/api/products";
  const ORDER_API_URL = "http://localhost:8080/api/orders";

  // ================= LOGIN =================

  const openLogin = () => {
    setShowLogin(true);
    setRole("");
    setRegister(false);
  };

  const closeLogin = () => {
    setShowLogin(false);
    setRole("");
    setRegister(false);
  };

  const openRoleLogin = (selectedRole) => {
    setRole(selectedRole);
    setRegister(false);
  };

  const goBack = () => {
    setRole("");
    setRegister(false);
  };

  const goBackToLogin = () => {
    setRegister(false);
  };

  // ================= PRODUCTS =================

  const handleProductChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Could not connect to the backend.");
    }
  };

  const addProduct = async () => {
  if (
    !productForm.name ||
    !productForm.category ||
    !productForm.quantity ||
    !productForm.price ||
    !productForm.location
  ) {
    alert("Please fill all product details.");
    return;
  }

  const product = {
    name: productForm.name,
    category: productForm.category,
    quantity: Number(productForm.quantity),
    price: Number(productForm.price),
    location: productForm.location,
  };

  console.log("Sending product:", product);

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    console.log("Response status:", response.status);

    const responseText = await response.text();

    console.log("Response:", responseText);

    if (!response.ok) {
      throw new Error(
        `Server error ${response.status}: ${responseText}`
      );
    }

    const savedProduct = JSON.parse(responseText);

    setProducts((currentProducts) => [
      ...currentProducts,
      savedProduct,
    ]);

    alert("Product added successfully! 🌱");

    setProductForm({
      name: "",
      category: "",
      quantity: "",
      price: "",
      location: "",
    });

    setShowProductModal(false);
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    alert(
      "Could not add product.\n\n" +
      error.message
    );
  }
};

  // ================= FARMER LOGIN =================

  const handleFarmerLogin = async () => {
    await loadProducts();

    setShowLogin(false);
    setRole("");
    setRegister(false);
    setFarmerDashboard(true);
  };

  // ================= BUYER LOGIN =================

  const handleBuyerLogin = async () => {
    await loadProducts();

    setShowLogin(false);
    setRole("");
    setRegister(false);
    setBuyerLoggedIn(true);
  };

  const handleFarmerLogout = () => {
    setFarmerDashboard(false);
  };

  const handleBuyerLogout = () => {
    setBuyerLoggedIn(false);
    setShowCart(false);
    setShowCheckout(false);
  };

  // ================= CART =================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cartQuantity: item.cartQuantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          cartQuantity: 1,
        },
      ];
    });

    alert(`${product.name} added to cart 🛒`);
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              cartQuantity: item.cartQuantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cartQuantity: item.cartQuantity - 1,
              }
            : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const getCartCount = () => {
    return cart.reduce(
      (total, item) => total + item.cartQuantity,
      0
    );
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.cartQuantity,
      0
    );
  };

  // ================= CHECKOUT =================

  const handleCheckoutChange = (e) => {
    setCheckoutForm({
      ...checkoutForm,
      [e.target.name]: e.target.value,
    });
  };

  const openCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setShowCart(false);
    setShowCheckout(true);
  };

  // ================= PLACE ORDER =================

  const placeOrder = async () => {
    if (
      !checkoutForm.name ||
      !checkoutForm.phone ||
      !checkoutForm.address ||
      !checkoutForm.city ||
      !checkoutForm.pincode
    ) {
      alert("Please fill all delivery details.");
      return;
    }

    if (!/^\d{10}$/.test(checkoutForm.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(checkoutForm.pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const totalAmount = getCartTotal();

    try {
      /*
       * Save every cart item as a separate order.
       * Example:
       * Tomato x 2 -> one order row
       * Rice x 1   -> another order row
       */

      for (const item of cart) {
        const order = {
          customerName: checkoutForm.name,
          phone: checkoutForm.phone,
          address: checkoutForm.address,
          city: checkoutForm.city,
          pincode: checkoutForm.pincode,
          paymentMethod: checkoutForm.paymentMethod,
          productName: item.name,
          quantity: Number(item.cartQuantity),
          totalAmount: Number(
            (item.price * item.cartQuantity).toFixed(2)
          ),
          status: "PLACED",
        };

        const response = await fetch(ORDER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        });

        if (!response.ok) {
          throw new Error("Failed to save order");
        }
      }

      // Save details for confirmation screen
      setLastOrder({
        amount: totalAmount,
        paymentMethod: checkoutForm.paymentMethod,
        city: checkoutForm.city,
      });

      // Close checkout
      setShowCheckout(false);

      // Clear cart after successful database save
      setCart([]);

      // Show confirmation
      setOrderPlaced(true);

      alert("Order placed successfully! 🎉");
    } catch (error) {
      console.error("Error placing order:", error);

      alert(
        "Could not place the order. Please make sure Spring Boot is running."
      );
    }
  };

  const closeOrderConfirmation = () => {
    setOrderPlaced(false);

    setCheckoutForm({
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      paymentMethod: "Cash on Delivery",
    });
  };

  // =================================================
  // FARMER DASHBOARD
  // =================================================

  if (farmerDashboard) {
    return (
      <div className="farmer-dashboard">

        <nav className="dashboard-navbar">

          <div className="dashboard-logo">
            🌱 Farm2Home
          </div>

          <div className="dashboard-user">

            <span>👨‍🌾</span>
            <span>Farmer</span>

            <button
              className="logout-btn"
              onClick={handleFarmerLogout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="dashboard-content">

          <div className="dashboard-heading">

            <div>

              <p className="dashboard-small-title">
                FARMER DASHBOARD
              </p>

              <h1>
                Welcome, Farmer 👋
              </h1>

              <p>
                Manage your products, orders and earnings
                from one place.
              </p>

            </div>

            <button
              className="add-product-btn"
              onClick={() => setShowProductModal(true)}
            >
              + Add New Product
            </button>

          </div>

          <div className="stats-container">

            <div className="stat-card">

              <div className="stat-icon">
                🌾
              </div>

              <div>
                <p>Total Products</p>
                <h2>{products.length}</h2>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon">
                📦
              </div>

              <div>
                <p>Total Orders</p>
                <h2>0</h2>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon">
                💰
              </div>

              <div>
                <p>Total Earnings</p>
                <h2>₹0</h2>
              </div>

            </div>

          </div>

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h2>
                    My Products
                  </h2>

                  <p>
                    Products you are selling on Farm2Home.
                  </p>

                </div>

                <button
                  className="small-add-btn"
                  onClick={() => setShowProductModal(true)}
                >
                  + Add Product
                </button>

              </div>

              {products.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    🌱
                  </div>

                  <h3>
                    No products yet
                  </h3>

                  <p>
                    Start selling your fresh farm products
                    directly to customers.
                  </p>

                  <button
                    className="add-product-btn"
                    onClick={() => setShowProductModal(true)}
                  >
                    + Add Your First Product
                  </button>

                </div>

              ) : (

                <div className="product-list">

                  {products.map((product) => (

                    <div
                      className="product-item"
                      key={product.id}
                    >

                      <div className="product-item-icon">
                        🌾
                      </div>

                      <div className="product-item-info">

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          {product.category}
                        </p>

                        <span>
                          {product.quantity} kg available
                        </span>

                        <span>
                          ₹{product.price}/kg
                        </span>

                        <small>
                          📍 {product.location}
                        </small>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h2>
                    Recent Orders
                  </h2>

                  <p>
                    Your latest customer orders.
                  </p>

                </div>

              </div>

              <div className="empty-state">

                <div className="empty-icon">
                  📦
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Your customer orders will appear here.
                </p>

              </div>

            </div>

          </div>

          <div className="quick-actions">

            <h2>
              Quick Actions
            </h2>

            <div className="quick-action-container">

              <button
                className="quick-action"
                onClick={() => setShowProductModal(true)}
              >

                <span>🌾</span>

                <div>

                  <strong>
                    Add Product
                  </strong>

                  <small>
                    List a new farm product
                  </small>

                </div>

              </button>

              <button className="quick-action">

                <span>📦</span>

                <div>

                  <strong>
                    View Orders
                  </strong>

                  <small>
                    Manage customer orders
                  </small>

                </div>

              </button>

              <button className="quick-action">

                <span>💰</span>

                <div>

                  <strong>
                    View Earnings
                  </strong>

                  <small>
                    Track your income
                  </small>

                </div>

              </button>

            </div>

          </div>

        </main>

        {showProductModal && (

          <div className="product-overlay">

            <div className="product-modal">

              <button
                className="close-btn"
                onClick={() => setShowProductModal(false)}
              >
                ×
              </button>

              <h2>
                🌾 Add New Product
              </h2>

              <p>
                Add your fresh farm product
              </p>

              <input
                className="login-input"
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleProductChange}
                placeholder="Enter product name"
              />

              <select
                className="login-input"
                name="category"
                value={productForm.category}
                onChange={handleProductChange}
              >

                <option value="">
                  Select category
                </option>

                <option value="Vegetables">
                  Vegetables
                </option>

                <option value="Fruits">
                  Fruits
                </option>

                <option value="Grains">
                  Grains
                </option>

                <option value="Dairy">
                  Dairy
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

              <input
                className="login-input"
                type="number"
                name="quantity"
                value={productForm.quantity}
                onChange={handleProductChange}
                placeholder="Quantity in kg"
              />

              <input
                className="login-input"
                type="number"
                name="price"
                value={productForm.price}
                onChange={handleProductChange}
                placeholder="Price per kg (₹)"
              />

              <input
                className="login-input"
                type="text"
                name="location"
                value={productForm.location}
                onChange={handleProductChange}
                placeholder="Farm location"
              />

              <button
                className="form-login-btn"
                onClick={addProduct}
              >
                Add Product
              </button>

            </div>

          </div>

        )}

      </div>
    );
  }

  // =================================================
  // BUYER DASHBOARD
  // =================================================

  if (buyerLoggedIn) {
    return (
      <div className="buyer-dashboard">

        <nav className="dashboard-navbar">

          <div className="dashboard-logo">
            🌱 Farm2Home
          </div>

          <div className="buyer-info">

            <span>
              🛒 Buyer
            </span>

            <button
              className="logout-btn"
              onClick={handleBuyerLogout}
            >
              Logout
            </button>

          </div>

        </nav>

        <div className="buyer-content">

          <div className="buyer-heading">

            <p>
              BUYER DASHBOARD
            </p>

            <h1>
              Welcome to Farm2Home 👋
            </h1>

            <span>
              Fresh products directly from local farmers.
            </span>

          </div>

          <div className="buyer-cards">

            <div className="buyer-card">

              <div className="buyer-card-icon">
                🥦
              </div>

              <h3>
                Fresh Products
              </h3>

              <p>
                Browse fresh products directly
                from farmers.
              </p>

              <button
                className="browse-btn"
                onClick={loadProducts}
              >
                Browse Products →
              </button>

            </div>

            <div className="buyer-card">

              <div className="buyer-card-icon">
                🛒
              </div>

              <h3>
                My Cart
              </h3>

              <p>
                {getCartCount() === 0
                  ? "View products you want to purchase."
                  : `${getCartCount()} product${
                      getCartCount() > 1 ? "s" : ""
                    } in your cart.`}
              </p>

              <button
                className="browse-btn"
                onClick={() => setShowCart(true)}
              >
                View Cart ({getCartCount()}) →
              </button>

            </div>

            <div className="buyer-card">

              <div className="buyer-card-icon">
                📦
              </div>

              <h3>
                My Orders
              </h3>

              <p>
                Track your previous and current orders.
              </p>

              <button className="browse-btn">
                View Orders →
              </button>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  🌱 Fresh Products
                </h2>

                <p>
                  Products directly from farmers.
                </p>

              </div>

              <button
                className="small-add-btn"
                onClick={loadProducts}
              >
                Refresh
              </button>

            </div>

            {products.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  🥦
                </div>

                <h3>
                  No products available
                </h3>

                <p>
                  Farmers haven't added products yet.
                </p>

              </div>

            ) : (

              <div className="product-list">

                {products.map((product) => (

                  <div
                    className="product-item"
                    key={product.id}
                  >

                    <div className="product-item-icon">
                      🌾
                    </div>

                    <div className="product-item-info">

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        {product.category}
                      </p>

                      <span>
                        {product.quantity} kg available
                      </span>

                      <span>
                        ₹{product.price}/kg
                      </span>

                      <small>
                        📍 {product.location}
                      </small>

                      <button
                        className="browse-btn"
                        onClick={() => addToCart(product)}
                      >
                        🛒 Add to Cart
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* ================= CART ================= */}

        {showCart && (

          <div
            className="login-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCart(false);
              }
            }}
          >

            <div className="login-modal cart-modal">

              <button
                className="close-btn"
                onClick={() => setShowCart(false)}
              >
                ×
              </button>

              <div className="modal-icon">
                🛒
              </div>

              <h2>
                My Cart
              </h2>

              <p>
                Products you want to purchase.
              </p>

              {cart.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    🛒
                  </div>

                  <h3>
                    Your cart is empty
                  </h3>

                  <p>
                    Add fresh products from local farmers.
                  </p>

                </div>

              ) : (

                <>

                  <div className="cart-list">

                    {cart.map((item) => (

                      <div
                        className="cart-item"
                        key={item.id}
                      >

                        <div className="product-item-icon">
                          🌾
                        </div>

                        <div className="cart-item-info">

                          <h3>
                            {item.name}
                          </h3>

                          <p>
                            ₹{item.price}/kg
                          </p>

                          <div className="quantity-controls">

                            <button
                              onClick={() =>
                                decreaseQuantity(item.id)
                              }
                            >
                              −
                            </button>

                            <span>
                              {item.cartQuantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(item.id)
                              }
                            >
                              +
                            </button>

                          </div>

                        </div>

                        <div className="cart-item-right">

                          <strong>
                            ₹
                            {(
                              item.price *
                              item.cartQuantity
                            ).toFixed(2)}
                          </strong>

                          <button
                            className="remove-cart-btn"
                            onClick={() =>
                              removeFromCart(item.id)
                            }
                          >
                            Remove
                          </button>

                        </div>

                      </div>

                    ))}

                  </div>

                  <div className="cart-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹{getCartTotal().toFixed(2)}
                    </strong>

                  </div>

                  <button
                    className="form-login-btn"
                    onClick={openCheckout}
                  >
                    Proceed to Checkout →
                  </button>

                </>

              )}

            </div>

          </div>

        )}

        {/* ================= CHECKOUT ================= */}

        {showCheckout && (

          <div className="login-overlay checkout-overlay">

            <div className="login-modal checkout-modal">

              <button
                className="close-btn"
                onClick={() => setShowCheckout(false)}
              >
                ×
              </button>

              <div className="modal-icon">
                📦
              </div>

              <h2>
                Checkout
              </h2>

              <p>
                Complete your delivery details.
              </p>

              <div className="checkout-section">

                <h3>
                  📍 Delivery Details
                </h3>

                <input
                  className="login-input"
                  type="text"
                  name="name"
                  value={checkoutForm.name}
                  onChange={handleCheckoutChange}
                  placeholder="Full Name"
                />

                <input
                  className="login-input"
                  type="tel"
                  name="phone"
                  value={checkoutForm.phone}
                  onChange={handleCheckoutChange}
                  placeholder="10-digit Phone Number"
                  maxLength="10"
                />

                <textarea
                  className="login-input checkout-textarea"
                  name="address"
                  value={checkoutForm.address}
                  onChange={handleCheckoutChange}
                  placeholder="House No, Street, Area"
                  rows="3"
                />

                <div className="checkout-row">

                  <input
                    className="login-input"
                    type="text"
                    name="city"
                    value={checkoutForm.city}
                    onChange={handleCheckoutChange}
                    placeholder="City"
                  />

                  <input
                    className="login-input"
                    type="text"
                    name="pincode"
                    value={checkoutForm.pincode}
                    onChange={handleCheckoutChange}
                    placeholder="Pincode"
                    maxLength="6"
                  />

                </div>

              </div>

              <div className="checkout-section">

                <h3>
                  💳 Payment Method
                </h3>

                <label className="payment-option">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={
                      checkoutForm.paymentMethod ===
                      "Cash on Delivery"
                    }
                    onChange={handleCheckoutChange}
                  />

                  <span>
                    💵 Cash on Delivery
                  </span>

                </label>

                <label className="payment-option">

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={
                      checkoutForm.paymentMethod === "UPI"
                    }
                    onChange={handleCheckoutChange}
                  />

                  <span>
                    📱 UPI
                  </span>

                </label>

              </div>

              <div className="checkout-summary">

                <h3>
                  🧾 Order Summary
                </h3>

                {cart.map((item) => (

                  <div
                    className="checkout-item"
                    key={item.id}
                  >

                    <span>
                      {item.name} × {item.cartQuantity}
                    </span>

                    <strong>
                      ₹
                      {(
                        item.price *
                        item.cartQuantity
                      ).toFixed(2)}
                    </strong>

                  </div>

                ))}

                <div className="checkout-item">

                  <span>
                    Delivery
                  </span>

                  <strong>
                    FREE
                  </strong>

                </div>

                <div className="checkout-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹{getCartTotal().toFixed(2)}
                  </strong>

                </div>

              </div>

              <button
                className="form-login-btn"
                onClick={placeOrder}
              >
                ✅ Place Order • ₹
                {getCartTotal().toFixed(2)}
              </button>

            </div>

          </div>

        )}

        {/* ================= ORDER CONFIRMATION ================= */}

        {orderPlaced && (

          <div className="login-overlay">

            <div className="login-modal order-success">

              <div className="success-icon">
                ✅
              </div>

              <h2>
                Order Placed Successfully!
              </h2>

              <p>
                Thank you for shopping with Farm2Home.
              </p>

              <div className="success-box">

                <strong>
                  🎉 Your fresh products are on the way!
                </strong>

                <p>
                  Payment: {lastOrder.paymentMethod}
                </p>

                <p>
                  Delivery to: {lastOrder.city}
                </p>

                <p>
                  Amount: ₹
                  {lastOrder.amount.toFixed(2)}
                </p>

              </div>

              <button
                className="form-login-btn"
                onClick={closeOrderConfirmation}
              >
                Continue Shopping
              </button>

            </div>

          </div>

        )}

      </div>
    );
  }

  // =================================================
  // MAIN WEBSITE
  // =================================================

  return (
    <div>

      <nav className="navbar">

        <div className="logo">
          🌱 Farm2Home
        </div>

        <div className="nav-links">

          <a href="#">
            Home
          </a>

          <a href="#">
            Products
          </a>

          <a href="#">
            Farmers
          </a>

          <a href="#">
            About
          </a>

        </div>

        <button
          type="button"
          className="login-btn"
          onClick={openLogin}
        >
          Login
        </button>

      </nav>

      <section className="hero">

        <div className="hero-content">

          <p className="small-title">
            🌾 FARM DIRECT • FRESH • TRUSTED
          </p>

          <h1>
            From <span>Farm</span>
            <br />
            Straight to Your <span>Home</span>
          </h1>

          <p className="hero-text">
            Connect directly with local farmers and get
            fresh, quality products at fair prices.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={openLogin}
            >
              Explore Products →
            </button>

            <button
              className="secondary-btn"
              onClick={() => {
                setShowLogin(true);
                setRole("farmer");
                setRegister(false);
              }}
            >
              Become a Farmer
            </button>

          </div>

        </div>

        <div className="hero-card">

          <div className="farm-icon">
            🌾
          </div>

          <h2>
            Fresh from the Farm
          </h2>

          <p>
            Supporting farmers while bringing freshness
            directly to your doorstep.
          </p>

        </div>

      </section>

      <section className="features">

        <div className="feature">

          <div>🌱</div>

          <h3>
            Fresh Products
          </h3>

          <p>
            Directly sourced from local farmers.
          </p>

        </div>

        <div className="feature">

          <div>🤝</div>

          <h3>
            Fair Prices
          </h3>

          <p>
            Better earnings for farmers and fair prices
            for buyers.
          </p>

        </div>

        <div className="feature">

          <div>🚚</div>

          <h3>
            Home Delivery
          </h3>

          <p>
            Get farm-fresh products delivered to your home.
          </p>

        </div>

      </section>

      {showLogin && (

        <div
          className="login-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLogin();
            }
          }}
        >

          <div className="login-modal">

            <button
              type="button"
              className="close-btn"
              onClick={closeLogin}
            >
              ×
            </button>

            {!role && (

              <>
                <div className="modal-icon">
                  🌱
                </div>

                <h2>
                  Welcome to Farm2Home
                </h2>

                <p>
                  How would you like to continue?
                </p>

                <button
                  type="button"
                  className="role-btn"
                  onClick={() => openRoleLogin("buyer")}
                >
                  🛒

                  <span>
                    <strong>
                      I'm a Buyer
                    </strong>

                    <small>
                      Buy fresh products directly
                    </small>
                  </span>

                </button>

                <button
                  type="button"
                  className="role-btn"
                  onClick={() => openRoleLogin("farmer")}
                >
                  👨‍🌾

                  <span>
                    <strong>
                      I'm a Farmer
                    </strong>

                    <small>
                      Sell your farm products
                    </small>
                  </span>

                </button>
              </>
            )}

            {role === "buyer" && !register && (

              <>
                <button
                  type="button"
                  className="back-btn"
                  onClick={goBack}
                >
                  ← Back
                </button>

                <div className="modal-icon">
                  🛒
                </div>

                <h2>
                  Buyer Login
                </h2>

                <p>
                  Login to shop fresh products.
                </p>

                <input
                  className="login-input"
                  type="email"
                  placeholder="Enter your email"
                />

                <input
                  className="login-input"
                  type="password"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="form-login-btn"
                  onClick={handleBuyerLogin}
                >
                  Login as Buyer
                </button>

                <p className="register-text">
                  Don't have an account?{" "}
                  <strong
                    onClick={() => setRegister(true)}
                  >
                    Create Account
                  </strong>
                </p>
              </>
            )}

            {role === "farmer" && !register && (

              <>
                <button
                  type="button"
                  className="back-btn"
                  onClick={goBack}
                >
                  ← Back
                </button>

                <div className="modal-icon">
                  👨‍🌾
                </div>

                <h2>
                  Farmer Login
                </h2>

                <p>
                  Login to manage your farm products.
                </p>

                <input
                  className="login-input"
                  type="email"
                  placeholder="Enter your email"
                />

                <input
                  className="login-input"
                  type="password"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="form-login-btn"
                  onClick={handleFarmerLogin}
                >
                  Login as Farmer
                </button>

                <p className="register-text">
                  Don't have an account?{" "}
                  <strong
                    onClick={() => setRegister(true)}
                  >
                    Create Account
                  </strong>
                </p>
              </>
            )}

            {register && (

              <>
                <button
                  type="button"
                  className="back-btn"
                  onClick={goBackToLogin}
                >
                  ← Back to Login
                </button>

                <div className="modal-icon">
                  {role === "buyer" ? "🛒" : "👨‍🌾"}
                </div>

                <h2>
                  Create{" "}
                  {role === "buyer"
                    ? "Buyer"
                    : "Farmer"}{" "}
                  Account
                </h2>

                <p>
                  Join Farm2Home today.
                </p>

                <input
                  className="login-input"
                  type="text"
                  placeholder="Enter your full name"
                />

                <input
                  className="login-input"
                  type="email"
                  placeholder="Enter your email"
                />

                <input
                  className="login-input"
                  type="tel"
                  placeholder="Enter your phone number"
                />

                <input
                  className="login-input"
                  type="password"
                  placeholder="Create a password"
                />

                {role === "farmer" && (

                  <input
                    className="login-input"
                    type="text"
                    placeholder="Enter your village / farm location"
                  />

                )}

                <button
                  type="button"
                  className="form-login-btn"
                  onClick={() =>
                    alert(
                      `${
                        role === "buyer"
                          ? "Buyer"
                          : "Farmer"
                      } account created!`
                    )
                  }
                >
                  Create Account
                </button>

                <p className="register-text">
                  Already have an account?{" "}
                  <strong
                    onClick={() => setRegister(false)}
                  >
                    Login
                  </strong>
                </p>

              </>
            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;