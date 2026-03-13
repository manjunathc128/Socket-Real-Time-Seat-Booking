import React, {useEffect, useState} from "react";  
import { useSelector, useDispatch} from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { login } from '@/redux/auth/authSlice';
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Alert, Stack, Center  } from "@mantine/core";
import { IconUser, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { Navigate, useNavigate } from "react-router-dom";
import { clearErrorLoading } from "@/redux/auth/authSlice"; 

const Login = (): React.ReactNode => {
    const [newusername, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const dispatch: AppDispatch  = useDispatch()   
    const navigate = useNavigate()
    const { username, token, loading, error } = useSelector((state: RootState) => state.auth) 
    
    const handleSubmit = async (e: React.FormEvent) => {
       try{ 
            e.preventDefault();
            if(newusername && password){
             const res = await dispatch(login({username: newusername, password})).unwrap()
             if(res){
                navigate('/')
             }
            }
        }catch(error){
            console.log(error, 'Login JSX')
        }
    }
    useEffect(() => {   
        if (!!(username && token)){
            // console.log('Login JSX...........', username, token)   
            navigate('/')
        }
     return () => { 
            dispatch(clearErrorLoading()) 
        }

    }, [])


    return (
        <Container size={420} my={40}>
            <Center>
                <Paper withBorder shadow="md" p={30} mt={30} radius="md" w="100%" >
                    <Title ta="center"  mb="md">
                        Login to Real Time Event Booking System 
                    </Title>
                    <Text c="dimmed" size="sm" ta="center" mb="xl">
                        Sign in to your account
                    </Text>
                    {error && (
                        <Alert
                         icon={<IconAlertCircle />}
                         color="red"
                         mb="md"
                         >
                          {error}  
                         </Alert>
                    )}
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput 
                            label="Username"
                            placeholder="Enter your username"
                            leftSection={<IconUser size="1rem" />}
                            value={newusername}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <PasswordInput 
                            label="Password"
                            placeholder="Enter your password"
                            leftSection={<IconLock size="1rem" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required

                        />
                        <Button 
                            type="submit"
                            fullWidth
                            mt="xl"
                            loading={loading}
                        >
                            Submit
                        </Button>
                  </Stack>
                </form>
                    <Text c="dimmed" size="sm" ta="center" mt="md" >
                        Don't have an account?{' '}
                        <Text 
                            component="a" 
                            c="blue" size="sm"
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                                navigate('/signup')}
                            }
                            >   
                            Sign Up
                        </Text>
                    </Text>
                </Paper>    
            </Center>
        </Container>
    )
}

export default Login

