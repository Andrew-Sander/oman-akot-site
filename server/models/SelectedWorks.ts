import {
  DataTypes,
  Model,
  Optional,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  Association,
} from "sequelize";
import sequelize from "../database";
import { SelectedSeries } from "./associationshit";

interface SelectedWorksAttributes {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  selectedSeriesId: number;
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type SelectedWorksCreationAttributes = Optional<SelectedWorksAttributes, "id">;

class SelectedWorks
  extends Model<SelectedWorksAttributes, SelectedWorksCreationAttributes>
  implements SelectedWorksAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public imageUrl!: string;
  public order!: number;
  public selectedSeriesId!: number;
  public available!: boolean; // Add this line

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public getSelectedSeries!: BelongsToGetAssociationMixin<SelectedSeries>;
  public setSelectedSeries!: BelongsToSetAssociationMixin<
    SelectedSeries,
    number
  >;
  public createSelectedSeries!: BelongsToCreateAssociationMixin<SelectedSeries>;

  // Possible inclusion of associated series
  public readonly selectedSeries?: SelectedSeries;

  // Association
  public static associations: {
    selectedSeries: Association<SelectedWorks, SelectedSeries>;
  };

  // Static method to define associations
  public static associate(models: any) {
    SelectedWorks.belongsTo(models.SelectedSeries, {
      foreignKey: "selectedSeriesId",
      as: "selectedSeries",
    });
  }
}

SelectedWorks.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    selectedSeriesId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "SelectedSeries",
        key: "id",
      },
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "SelectedWorks",
    timestamps: true,
  }
);

export default SelectedWorks;
