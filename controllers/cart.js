const Cart = require('../models/Cart'); 
const Product = require('../models/products');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const items = req.body.items;  // Lấy mảng sản phẩm từ request

    // Kiểm tra nếu mảng sản phẩm rỗng
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No products to add to cart' });
    }

    // Kiểm tra tồn kho cho mỗi sản phẩm
    for (let item of items) {
      const product = await Product.findById(item.productId);

      // Kiểm tra nếu sản phẩm không tồn tại
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      // Kiểm tra nếu số lượng yêu cầu vượt quá tồn kho
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for product ${product.name}` });
      }
    }

    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ userId: req.user.id });  // req.user.id là ID người dùng đã xác thực

    if (!cart) {
      // Nếu không có giỏ hàng, tạo mới giỏ hàng
      cart = new Cart({
        userId: req.user.id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
    } else {
      // Nếu giỏ hàng đã tồn tại, thêm sản phẩm vào giỏ hàng
      items.forEach(item => {
        const productIndex = cart.items.findIndex(cartItem => cartItem.productId.toString() === item.productId);

        if (productIndex > -1) {
          // Nếu sản phẩm đã có trong giỏ, cập nhật số lượng
          cart.items[productIndex].quantity += item.quantity;
        } else {
          // Nếu sản phẩm chưa có, thêm vào giỏ hàng
          cart.items.push({ productId: item.productId, quantity: item.quantity });
        }
      });
    }

    // Cập nhật lại thời gian
    cart.updatedAt = Date.now();
    await cart.save();  // Lưu giỏ hàng

    res.status(200).json({ message: 'Products added to cart successfully', cart });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
  
//Lấy thông tin giỏ hàng của user
exports.getUserCart = async (req,res) =>{
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price images');
    if (!cart) {
      return res.status(404).json({ msg: 'Không tìm thấy giỏ hàng' });
    }


    res.status(200).json({ message: 'Lấy giỏ hàng thành công', cart });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;  // Lấy productId từ URL
    console.log("productId", productId);

    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    cart.items = cart.items.filter(item => !item.productId.equals(productId));

    // Nếu không còn sản phẩm nào, xóa giỏ hàng
    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ message: 'Product removed and cart deleted (empty)' });
    }

    // Cập nhật lại thời gian
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


  // Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartQuantity = async (req, res) => {
    try {
      const { productId, quantity } = req.body;  // Lấy productId và quantity từ request
  
      // Tìm giỏ hàng của người dùng
      let cart = await Cart.findOne({ userId: req.user.id });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Tìm sản phẩm trong giỏ hàng
      const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  
      if (productIndex > -1) {
        // Nếu sản phẩm có trong giỏ, cập nhật số lượng
        cart.items[productIndex].quantity = quantity;
      } else {
        return res.status(404).json({ message: 'Product not found in cart' });
      }
  
      // Cập nhật lại thời gian
      cart.updatedAt = Date.now();
      await cart.save();
  
      res.status(200).json({ message: 'Cart updated successfully', cart });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  