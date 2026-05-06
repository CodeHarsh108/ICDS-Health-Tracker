package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.util.WhoLmsTables;
import org.springframework.stereotype.Service;

@Service
public class ZScoreCalculator {

    /**
     * Calculate weight-for-age Z-score using WHO LMS method.
     * @param ageMonths age in months (0 to 60)
     * @param weightKg actual weight in kg
     * @param gender "MALE" or "FEMALE"
     * @return Z-score
     */
    public double calculateZScore(int ageMonths, double weightKg, String gender) {
        if (ageMonths < 0 || ageMonths > 60) {
            throw new IllegalArgumentException("Age must be between 0 and 60 months");
        }
        double L = WhoLmsTables.getL(gender, ageMonths);
        double M = WhoLmsTables.getM(gender, ageMonths);
        double S = WhoLmsTables.getS(gender, ageMonths);

        if (L == 0) {
            // Box-Cox transformation: for L=0, use log
            return Math.log(weightKg / M) / S;
        } else {
            return (Math.pow(weightKg / M, L) - 1) / (L * S);
        }
    }

    /**
     * Get classification based on Z-score (WHO standards).
     */
    public String classifyZScore(double zScore) {
        if (zScore < -3) return "Severely underweight";
        else if (zScore < -2) return "Underweight";
        else if (zScore > 3) return "Obese";
        else if (zScore > 2) return "Overweight";
        else return "Normal";
    }
}