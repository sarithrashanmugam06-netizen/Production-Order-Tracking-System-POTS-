import { useState } from "react";

function ProductForm() {

    const [product, setProduct] = useState({
        name:"",
        category:"",
        unit:"",
        price:""
    });

    function handleChange(e){
        setProduct({
            ...product,
            [e.target.name]:e.target.value
        });
    }

    function handleSubmit(e){
        e.preventDefault();

        console.log(product);

        alert("Product Added Successfully");
    }

    return(

        <form onSubmit={handleSubmit}>

            <input
            type="text"
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            />

            <br /><br />

            <input
            type="text"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            />

            <br /><br />

            <input
            type="text"
            name="unit"
            placeholder="Unit"
            onChange={handleChange}
            />

            <br /><br />

            <input
            type="number"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            />

            <br /><br />

            <button>Add Product</button>

        </form>

    )

}

export default ProductForm;