import { FieldArray, Field, Formik,Form, ErrorMessage } from "formik"
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { UserState } from '../../utilities/type-declaration';
import * as yup from "yup"
import { Grid } from "@mui/material";


const formSchema = yup.object().shape({
    recipe: yup.string().min(3, "Must be at least 3 characters").required("This field is required"),
    cuisine: yup.string().min(3, "Must be at least 3 characters").required("This field is required"),
    description: yup.string().max(100, "Cannot exceed 100 characters"),
    ingredients: yup.array(
        yup.object({
        name: yup.string().min(3, "Must be at least 3 characters").required("This field is required"),
        quantity: yup.number().typeError("Only numbers allowed").positive("No negative numbers").required("This field is required"),
        measurement: yup.string(),
      })
    ).min(1, "Minimum 1 ingredient required"),
  instructions: yup.array(yup.string().required("This field is required")).min(1, "Minimum 1 instruction required"),
  imageurl: yup.array(yup.string().url("Must be a valid Url")),
  imagefile: yup.mixed()
})

const ONEMB = 1024 * 1024; // 1 MB




const CreateRecipeForm = ( {user}:{user:UserState} ) => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const initialValues= {
            owner: user,
            recipe: "",
            cuisine: "",
            description: "",
            ingredients: [{
              name: "",
              quantity: "",
              measurement: "",
            }],
            instructions: [""],
            imageurl: [""], 
            imagefile: "",
        }
    
      const convertToBase64 = (file: File): Promise<string> => {
        console.log(typeof(file))
        return new Promise((resolve,reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result as string)
            };
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
      }
    
    return (
        <>
        <Typography
        variant="body2"
        color="error"
        align="center"
        sx={{ marginTop: 2 }}
      >
        {error}
      </Typography>
        <Formik
        initialValues={initialValues}
        validationSchema={formSchema}
        onSubmit={async (values) => {
            console.log(values)
            try{
                const response = await fetch("/api/recipes/create", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(values), 
                });
                const data = await response.json();
                if (response.ok) {
                  navigate(`/recipes/${data._id}`)
                } else {
                  throw new Error("Failed to create recipe")
                }
              } catch (error: any) {
                setError(error.message)
              }
        }}
        >
            {({values, errors, touched, setValues, isSubmitting}) => (
        <Form autoComplete="off">
              <Grid container direction="column" spacing={2}>
                    <Grid item>
                    <Field
                    margin="normal"
                    fullWidth
                    type="text"
                    name="recipe"
                    id="recipe"
                    label="Recipe*"
                    as={TextField}
                    helperText={ <ErrorMessage name="recipe" />}
                    error={errors.recipe && touched.recipe}
                    />
                    </Grid>

                    <Grid item>
                    <Field
                    margin="normal"
                    fullWidth      
                    type="text"
                    name="cuisine"
                    id="cuisine"
                    label="Cuisine*"
                    as={TextField}
                    helperText={ <ErrorMessage name="cuisine" />}
                    error={errors.cuisine && touched.cuisine}
                    />
                    </Grid>

                    <Grid item>
                    <Field
                    margin="normal"
                    fullWidth
                    type="text"
                    name="description"
                    id="description"
                    label="Description"
                    as={TextField}
                    helperText={ <ErrorMessage name="description" />}
                    error={errors.description && touched.description}
                    />
                    </Grid>
  

        <Grid item>
            Ingredients:
        <FieldArray name="ingredients">
            {
                ({ push, remove }) => {
                    return <>
                        {
                            values.ingredients.map((_, index) => (
                                <Grid
                                container
                                item
                                key={index}
                                spacing={2}
                              >
                                <Grid item container spacing={2} xs={12} sm="auto">
                                <Grid item xs={12} sm={6}>
                                <Field
                                margin="normal"
                                fullWidth
                                type="text" 
                                name={`ingredients[${index}].name`} 
                                _id="name"
                                label="Name*" 
                                as={TextField}
                                helperText={ <ErrorMessage name={`ingredients[${index}].name`} />}
                                error={errors.ingredients && errors.ingredients[index]  && errors.ingredients[index].name  && touched.ingredients && touched.ingredients[index] && touched.ingredients[index].name}
                                />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                <Field 
                                margin="normal"
                                fullWidth
                                type="text"
                                name={`ingredients[${index}].quantity`} 
                                _id="quantity"
                                label="Quantity*"
                                as={TextField}
                                helperText={ <ErrorMessage name={`ingredients[${index}].quantity`} />}
                               error={errors.ingredients && errors.ingredients[index]  && errors.ingredients[index].quantity  && touched.ingredients && touched.ingredients[index] && touched.ingredients[index].quantity}
                                />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                <Field 
                                margin="normal"
                                fullWidth  
                                type="text"
                                name={`ingredients[${index}].measurement`} 
                                _id="measurement"
                                label="Measurement"
                                as={TextField}
                                />
                                </Grid>   

                                {index > 0 && (
                                <Grid item xs={12} sm="auto">
                                <Button
                                disabled={isSubmitting}
                                onClick={() => remove(index)}
                                >
                                Delete
                                </Button>
                               </Grid>
                                )}
                        </Grid>
                         </Grid>
                            ))
                        }
                        <Grid item>
                        <Button
                          disabled={isSubmitting}
                          variant="contained"
                          onClick={() => push("")}
                        >
                          Add Ingredient
                        </Button>
                      </Grid>
                    </>
                }
            }
        </FieldArray>
        </Grid>

        <Grid item>
            Instructions:
        <FieldArray name="instructions" >
            {
                ({ push, remove }) => {
                    return <>
                        {
                            values.instructions.map((_, index) => (
                                <Grid
                                container
                                item
                                key={index}
                                spacing={2}
                              >
                                <Grid item container spacing={2} xs={12} sm="auto">
                                <Grid item xs={12} sm={12}>
                                <Field
                                
                                 type="text"
                                 name={`instructions[${index}]`} 
                                 id="instructions"
                                 label="Instructions*"
                                 as={TextField}
                                 helperText={ <ErrorMessage name={`instructions[${index}]`} />}
                                 error={errors.instructions && errors.instructions[index] && touched.instructions && touched.instructions[index]}
                                 /> 
                               </Grid>

                                {index > 0 && (
                                <Grid item xs={12} sm="auto">
                                <Button
                                disabled={isSubmitting}
                                onClick={() => remove(index)}
                                >
                                Delete
                                </Button>
                               </Grid>
                                )}
                        </Grid>
                         </Grid>
                            ))
                        }
                    <Grid item>
                        <Button
                          disabled={isSubmitting}
                          variant="contained"
                          onClick={() => push("")}
                        >
                          Add Instruction
                        </Button>
                      </Grid>
                    </>
                }
            }
        </FieldArray>
        </Grid>

        <Grid item>
        <FieldArray name="imageurl">
            {
                ({ push, remove }) => {
                    return <>
                        {
                            values.imageurl.map((_, index) => (
                                <Grid
                                container
                                item
                                key={index}
                                spacing={2}
                              >
                                <Grid item container spacing={2} xs={12} sm="auto">
                                <Grid item xs={12} sm={12}>
                                <Field
                                margin="normal"
                                fullWidth
                                 type="text"
                                 name={`imageurl[${index}]`} 
                                 id="imageurl"
                                 label="Imageurl"
                                 as={TextField}
                                 helperText={ <ErrorMessage name={`imageurl[${index}]`} />}
                                 error={errors.imageurl && errors.imageurl[index] && touched.imageurl && touched.imageurl[index] }
                                 /> 
                               </Grid>

                                {index > 0 && (
                                <Grid item xs={12} sm="auto">
                                <Button
                                disabled={isSubmitting}
                                onClick={() => remove(index)}
                                >
                                Delete
                                </Button>
                               </Grid>
                                )}
                        </Grid>
                         </Grid>
                            ))
                        }
                    <Grid item>
                        <Button
                          disabled={isSubmitting}
                          variant="contained"
                          onClick={() => push("")}
                        >
                          Add Image
                        </Button>
                      </Grid>
                    </>
                }
            }
        </FieldArray>
        </Grid>

                <Grid item>
                    <input
                    type="file"
                    id="imagefile"
                    onChange={async (event) => {
                        if (event.target.files && event.target.files.length > 0) {
                        const file = event.target.files[0]
                        const maxSize = ONEMB;
                        if (file.size > maxSize) {
                          setError('File size exceeds the maximum allowed limit of 1 MB');
                          event.target.value = "";
                          return;
                        }
                        const base64 = await convertToBase64(file)
                        setValues({...values, imagefile: base64})
                    }
                      }}
                    />
               </Grid>

      <Button
          type="submit"
          disabled={isSubmitting}
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }} 
        >
        {isSubmitting ? "Submitting" : "Submit"}
        </Button>

        </Grid>
      </Form>
            )}
      </Formik>
      </>
    )
}

export default CreateRecipeForm



