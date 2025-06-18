# 2020-2024 Shanghai Gaokao General Batch Admission Data (v2025.1)

This table data is intended to help candidates understand the admission scores of previous years to assist in filling out their applications.

**Note: This table is only a convenient tool and does not guarantee the absolute accuracy of the data. Please refer to the official data and manuals released by the Shanghai Municipal Education Examination Authority!**

[简体中文](./README.md)

---

## Instructions (Recommended to open on a computer)

1.  **Enter your ranking**:
    In the cell to the left of `Your Ranking`, enter your (estimated or actual) ranking before proceeding. (Defaults to 0 if not filled)

2.  **Select a worksheet**:
    After entering your ranking, select a worksheet at the bottom of the window to use.
    *   **Master Sheet**: Consolidates data from 2020-2024.
    *   **"Year"-named worksheets**: Admission data for that year.
    *   **"Year+D"-named worksheets**: Score distribution table for that year.

3.  **Usage Examples**:
    *   Analyze the changes in admission rankings of institutions across years.
    *   Analyze which institution-major groups you might be admitted to based on this year's ranking.

---

## Column Descriptions (Please use the filter function flexibly)

| Header         | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| **Code**       | Major group code                                                   |
| **Group Name** | Institution Name + Group Name                                      |
| **Institution**| Institution Name                                                   |
| **Group No.**  | Major group number under the institution                           |
| **Cutoff**     | Minimum admission score for the year                               |
| **Chinese+Math** | The following columns show the test score data of the last admitted student |
| **High Chinese/Math** |                                                                    |
| **Foreign Lang.**|                                                                    |
| **Highest Optional** |                                                                    |
| **2nd Highest Optional** |                                                                    |
| **Lowest Optional** |                                                                    |
| **Bonus Pts**  |                                                                    |
| **Year**       | Data year                                                          |
| **# at Same Score**| Number of students with the same admission score                     |
| **Lowest Rank**| Lowest rank corresponding to the admission score                  |
| **Highest Rank**| Highest rank corresponding to the admission score                 |
| **Admitted**   | Whether you can be admitted based on the rank for the year (1 for yes) |
| **Rank Lead**  | The number of ranks ahead of the lowest rank, reflecting the probability of admission to some extent |

#### Notes

*   The information on institutions, corresponding codes, group numbers, and major groups may change each year. Please use this in conjunction with the admission brochure for the current year.
*   There is competition among students with the same score. Reaching the cutoff score does not guarantee admission! The data for `Lowest Rank`, `Highest Rank`, and `Admitted` are based solely on the score distribution table corresponding to the cutoff score and do not mean that reaching the lowest rank or having "1" in the `Admitted` column guarantees admission!
*   If `(#N/A)` appears, it means no candidates were admitted to that major group in that year.

---

## Repository Structure

```
.
├── 志愿工具-2020-2024年投档数据v2025.1.xlsx
├── data.json # raw data
├── README.md
└── README.en.md
```

---

## Miscellaneous

*   **Data Source**: Shanghai Municipal Education Examination Authority

### Changelog

*   **v2025.1**: Updated with 2024 data.
*   **v1.2**: Updated with Q-group admission data. 