import { useState } from "react";
import { useCart } from "../lib/cartContext";

function priceLabel(item) {
  const minimum = Number(item.priceMin).toLocaleString("en-IN");
  return item.priceMax != null && Number(item.priceMax) !== Number(item.priceMin)
    ? `₹${minimum} - ₹${Number(item.priceMax).toLocaleString("en-IN")}`
    : `₹${minimum}`;
}

export default function CartDrawer() {
  const { items, itemCount, changeQuantity, removeItem, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  function placeOrder() {
    const lines = items.map((item) => (
      `- ${item.name} (${item.modelNumber}) | ${item.quantity} sarees | ${priceLabel(item)}`
    ));
    const message = [
      "Hello Sargam Sarees, I would like to place a wholesale order:",
      "",
      ...lines,
      "",
      `Total sarees: ${itemCount}`,
      "Please confirm availability and final wholesale pricing.",
    ].join("\n");
    window.open(`https://wa.me/918918367311?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    clearCart();
    setIsOpen(false);
  }

  return (
    <>
      <button className="cart-button" type="button" onClick={() => setIsOpen(true)} aria-label={`Open cart with ${itemCount} sarees`}>
        Cart <span>{itemCount}</span>
      </button>
      {isOpen ? (
        <div className="cart-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Wholesale cart" onClick={(event) => event.stopPropagation()}>
            <div className="cart-header">
              <div>
                <p className="eyebrow"><span /> Your selection</p>
                <h2>Wholesale cart</h2>
              </div>
              <button className="cart-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close cart">×</button>
            </div>
            {items.length ? (
              <>
                <div className="cart-items">
                  {items.map((item) => (
                    <div className="cart-item" key={item.id}>
                      {item.image ? <img src={item.image} alt="" /> : <div className="cart-item-placeholder">SS</div>}
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <small>{item.modelNumber} · {priceLabel(item)}</small>
                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one batch of ${item.name}`}>−</button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one batch of ${item.name}`}>+</button>
                          </div>
                          <button className="remove-item" type="button" onClick={() => removeItem(item.id)}>Remove</button>
                        </div>
                        <small>In batches of {item.batchSize}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total"><span>Total quantity</span><strong>{itemCount} sarees</strong></div>
                  <button className="whatsapp-button" type="button" onClick={placeOrder}>Place order on WhatsApp <span>→</span></button>
                  <button className="clear-cart" type="button" onClick={clearCart}>Clear cart</button>
                </div>
              </>
            ) : (
              <div className="empty-cart"><span>◌</span><p>Your wholesale cart is empty.</p><small>Add styles in complete batches to start an order.</small></div>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
