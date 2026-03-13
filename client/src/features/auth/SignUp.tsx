import React, { use, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Alert,
    Stack,
    Center
} from "@mantine/core";
import { IconUser, IconLock, IconAlertCircle } from '@tabler/icons-react';
import { RootState, AppDispatch } from "@/redux/store";
import { signup } from '@/redux/auth/authSlice';

const SignUp = () => {
    const [newusername, setNewUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate()
    const { loading, error, token, username } = useSelector((state: RootState) => state.auth);

    useEffect( () => {
        if (!!(username && token)){
            navigate('/')
        }
    }, [username, token, navigate])

    const handleSubmit = (e: React.FormEvent) => {
       try{ 
            e.preventDefault()

            if(password !== confirmPassword){
                return 

            }
            if(newusername && password){
               dispatch(signup({username: newusername, password})).unwrap().then(() => {
                navigate('/')
               })
            }
        }catch(err){

        }
    }

    const handleNavigation = () => { navigate('/login') }

    return(
        <Container size={420} my={40}>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md" w="100%" > 
                <Title ta="center" mb="md">
                    Create Account    
                </Title>
                <Text c="dimmed" size="sm" ta="center" mb="xl">
                    Sign up form a new account
                </Text>
                { error && (
                    <Alert
                        icon={<IconAlertCircle size="1rem" />}
                        color="red"
                        mb="md"
                    >
                        {error}
                    </Alert>    
                )}
                { password !== confirmPassword && confirmPassword && (
                    <Alert 
                        icon={<IconAlertCircle size="1rem" /> }
                        color="red"
                        mb="md"
                    >
                        Passwords do not match 
                    </Alert>    
                )}
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label="Username"
                            placeholder="Choose a username"
                            leftSection={<IconUser size="1rem" />}
                            value={newusername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                        />
                        <PasswordInput 
                            label="Password"
                            placeholder="Create a password"
                            leftSection={<IconLock size="1rem" /> }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required    
                        />    
                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            leftSection={<IconLock size="1rem" /> }
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button 
                            type="submit"
                            fullWidth
                            mt="xl"
                            loading={loading}
                            disabled={password !== confirmPassword}
                         >
                            Sign Up    
                        </Button>   
                    </Stack>
                </form>
                <Text c="dimmed" size="sm" ta="center" mt="md" >
                        Already have an account?{' '}
                        <Text 
                            component="a" 
                            c="blue" 
                            size="sm"
                            onClick={handleNavigation}
                            style={{ cursor: 'pointer' }}
                            >   
                            Sign In
                        </Text>
                    </Text>
            </Paper>
        </Container>
    )
}

export default SignUp;