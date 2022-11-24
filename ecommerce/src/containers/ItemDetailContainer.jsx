import { useEffect, useState, useContext } from "react"
import { useParams } from "react-router-dom"
import { Button, Flex, Heading, Icon, Image, Text } from "@chakra-ui/react"
import { doc, getDoc } from "firebase/firestore"
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"
import { MdAdd, MdOutlineShoppingCart, MdRemove } from 'react-icons/md'

import { db } from "../firebase/client"
import { Context } from "../context"

import { Wrapper } from "../components/Wrapper"
import { Error404 } from "./Error404"
import { Spinner } from "../components/Spinner"

import { notifyError, notifySuccess } from "../services/notifications"
import { formatPrice } from "../services/formatPrice"

export const ItemDetailContainer = () => {
    const [product, setProduct] = useState("")
    const [productQuantity, setProductQuantity] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isOutOfStock, setIsOutOfStock] = useState(false)

    const context = useContext(Context)
    const { cart, setCart } = context
    
    const params = useParams()
    const { category, productId } = params

    const getProduct = async (category, id) => {
        try{
            const docRef = doc(db, category, id);
            const docSnap = await getDoc(docRef);
    
            if (docSnap.exists()) {
                setProduct({id: docSnap.id, ...docSnap.data()})
            } else {
                notifyError(`Product "${product.name.toUpperCase()}" is gone.`)
            }

            setIsLoading(false)
        }catch(error){
            console.log(error)
        }
    }
    
    const removeProduct = () => {
        if(productQuantity <= product.stock){
            setProductQuantity(previous => previous - 1)
            setIsOutOfStock(false)
        }else{
            return
        }

    }
    
    const addProduct = () => {
        const timer = () => setTimeout(() => {
            setIsOutOfStock(false)
        }, 3000)

        if(productQuantity >= product.stock){
            setIsOutOfStock(true)
            timer()
        }else{
            setProductQuantity(previous => previous + 1)
        }
    }

    const addToCart = (id) => {
        if(!productQuantity){
            return notifyError("Please select a valid quantity before adding a product.")
        }

        setCart(previous => {
            if(previous.length){
                const total = [...previous, {...product, quantity: productQuantity}]
                const reduced = total.reduce((arr, item) => {
                    const repeated = arr.find(element => element.id === item.id)

                    if(repeated){
                        const newArray = arr.map(element => element.id === item.id ? {...item, quantity: productQuantity} : element)
                        return newArray
                    }else{
                        return [...arr, item]
                    }
                }, [])
                
                return reduced
            }else{
                return [{...product, quantity: productQuantity}]
            }
        })

        return notifySuccess(`Product added successfully.`)
    }

    const handleInputQuantity = (event) => setProductQuantity(+event.target.value)

    useEffect(()=> {
        getProduct(category, productId)
    }, [category, productId])

    if(isLoading){
        return <Spinner/>
    }

    return (
        <>
                {
                    product
                        ? <Wrapper>
                            <Flex gap={24} maxWidth={1000} minWidth={250} padding={8} flexWrap={{base: "wrap", md: "nowrap"}} justifyContent="center">
                                <Image src={product?.image} alt={product?.name} maxWidth={350} maxHeight={350} objectFit="contain" borderRadius={12}/>
                                <Flex flexDirection="column" justifyContent="space-between" alignItems="center" gap={16} maxWidth={{base: 350, md: 500}}>
                                    <Flex flexDirection="column" gap={2}>
                                        <Heading as="h1" fontSize={32} fontWeight={1000}>{product?.name?.toUpperCase()}</Heading>
                                        <Text as="span" fontSize={14}>Stock: {product.stock}</Text>
                                        <Text as="span" fontSize={24}>{formatPrice(product?.price)}</Text>
                                    </Flex>
                                    <Flex flexDirection="column" gap={4} maxWidth={350}>
                                        <Flex width="100%" gap={4} backgroundColor="secondary.500" zIndex="1">
                                            <Button onClick={removeProduct} disabled={!product.stock}>
                                                <Icon as={MdRemove}/>
                                            </Button>
                                            <input type="number" value={productQuantity} onChange={handleInputQuantity} readOnly style={{textAlign: "center", flex: 1, outline: "none", border: "none"}}/>
                                            <Button onClick={addProduct} disabled={!product.stock || productQuantity >= product.stock}>
                                                <Icon as={MdAdd}/>
                                            </Button>
                                        </Flex>
                                        <Button leftIcon={<MdOutlineShoppingCart/>} onClick={() => addToCart(product.id)} disabled={!product.stock}>Add to cart</Button>
                                    </Flex>
                                </Flex>
                            </Flex>
                            <ToastContainer/>
                        </Wrapper>
                        : <Error404/>
                    }
            </>
    )
}