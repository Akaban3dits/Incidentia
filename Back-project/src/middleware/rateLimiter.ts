import { RateLimiterMemory } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";
import { TooManyRequestsError } from "../utils/error";

const rateLimiter = new RateLimiterMemory({
  points: 40,
  duration: 60,
  keyPrefix: "rateLimiter",
});

const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || "unknown-ip";
    const rateRes = await rateLimiter.consume(ip);

    res.set({
      "X-RateLimit-Limit": String(40),
      "X-RateLimit-Remaining": String(rateRes.remainingPoints),
    });

    next();
  } catch (rejRes: any) {
    res.set({
      "Retry-After": String(Math.ceil(rejRes.msBeforeNext / 1000)),
      "X-RateLimit-Limit": String(40),
      "X-RateLimit-Remaining": String(0),
    });

    return next(
      new TooManyRequestsError(
        "Haz excedido el número de solicitudes permitidas. Intenta nuevamente más tarde."
      )
    );
  }
};

export default rateLimiterMiddleware;
