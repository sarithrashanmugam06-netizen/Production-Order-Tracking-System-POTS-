import { Form } from "react-bootstrap";

import useProductOptions from "../../hooks/useProductOptions";

function ProductSelect({ value, onChange, enabled = true }) {
  const products = useProductOptions(enabled);

  return (
    <Form.Select name="product_id" value={value} onChange={onChange}>
      <option value="">Select product</option>

      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.product_name}
        </option>
      ))}
    </Form.Select>
  );
}

export default ProductSelect;
