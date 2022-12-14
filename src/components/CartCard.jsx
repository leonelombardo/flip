import { useContext } from "react"
import { Link } from "react-router-dom"
import { Box, Button, Flex, Heading, Icon, Image, Text } from '@chakra-ui/react'
import { MdAdd, MdRemove } from "react-icons/md"

import { formatPrice } from '../services/formatPrice'
import { Context } from "../context"

export const CartCard = ({product}) => {
    const context = useContext(Context)
    const { cart, setCart } = context

    const removeProduct = (id) => {
        setCart(previous => {
                const thisProduct = previous.find(product => product.id === id ? product : "")

                if(thisProduct.quantity <= 1){
                    return previous.filter(product => product.id === id ? "" : product)
                }
                
                return previous.map(product => product.id === id ? {...product, quantity: product.quantity === 0 ? 0 : product.quantity - 1} : product)
            }    
        )
    }

    const addProduct = (id) => {
        setCart(previous => previous.map(product => product.id === id ? {...product, quantity: product.quantity >= product.stock ? product.quantity : product.quantity + 1} : product))
    }

    const deleteProduct = (id) => {
        setCart(previous => previous.filter(product => product.id === id ? "" : product))
    }

    return (
        <>
            <Box as="div" key={product.id} backgroundColor="secondary.500" borderBottom="2px" borderColor="#efefef" maxWidth="100%" paddingBottom={4}>
                <Flex gap={8} justifyContent="space-between" alignItems="center">
                    <Flex gap={8} alignItems="center">
                        <Link to={`/product/${product.category}/${product.id}`}>
                            <Image src={product.image} minWidth={25} width={50} height={50} objectFit="cover" objectPosition="center" borderRadius={6}/>
                        </Link>
                        <Flex flexDirection="column" gap={2}>
                            <Link to={`/product/${product.category}/${product.id}`}>
                                <Heading as="h2" fontSize={12}>{product.name.toUpperCase()}</Heading>
                            </Link>
                            <Text as="span" fontSize={12}>{formatPrice(product.price)}</Text>
                            {
                                product.stock
                                    ? <Text as="span" fontSize={10} color="secondary.500" backgroundColor="primary.500" width="fit-content" padding={1} borderRadius={4}>STOCK: {product.stock}</Text>
                                    : <Text as="span" fontSize={10} color="secondary.500" backgroundColor="red.500" width="fit-content" padding={1} borderRadius={4}>NO STOCK</Text>
                                    
                            }
                        </Flex>
                    </Flex>
                    <Flex gap={2} alignItems="center">
                        <Flex gap={2} flexDirection="column" alignSelf="center">
                            <Flex gap={2} alignItems="center">
                                <Button size="xs" onClick={() => removeProduct(product.id)}>
                                    <Icon as={MdRemove}/>
                                </Button>
                                <Text as="span" fontSize={12}>{product.quantity}</Text>
                                <Button size="xs" onClick={() => addProduct(product.id)} disabled={product.quantity >= product.stock}>
                                    <Icon as={MdAdd}/>
                                </Button>
                            </Flex>
                            <Text textAlign="center" fontSize={12}>{formatPrice(product.price * product.quantity)}</Text>
                        </Flex>
                        <Button variant="unstyled" size="xs" onClick={() => deleteProduct(product.id)}>
                            <Icon as={MdAdd} fontSize={24} color="#ccc" transform="rotate(45deg)"/>
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </>
    )
}