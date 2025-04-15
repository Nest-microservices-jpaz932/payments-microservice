import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    STRIPE_SECRET_KEY: string;
    STRIPE_SUCCESS_URL: string;
    STRIPE_CANCEL_URL: string;
    STRIPE_ENDPOINT_SECRET: string;
}

const envSchema = joi
    .object({
        PORT: joi.number().required(),
        STRIPE_SECRET_KEY: joi.string().required(),
        STRIPE_SUCCESS_URL: joi.string().required(),
        STRIPE_CANCEL_URL: joi.string().required(),
        STRIPE_ENDPOINT_SECRET: joi.string().required(),
    })
    .unknown(true);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value as EnvVars;

const {
    PORT: port = 3000,
    STRIPE_SECRET_KEY: stripe_secret_key,
    STRIPE_SUCCESS_URL: stripe_success_url,
    STRIPE_CANCEL_URL: stripe_cancel_url,
    STRIPE_ENDPOINT_SECRET: stripe_endpoint_secret,
} = envVars;

export const envs = {
    port,
    stripe_secret_key,
    stripe_success_url,
    stripe_cancel_url,
    stripe_endpoint_secret,
};
